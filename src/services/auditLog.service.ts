import { Request } from 'express';
import { AuditLog, IAuditLog } from '../models';
import { logger } from '../utils/logger';

export interface AuditLogOptions {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface AuditLogQuery {
  action?: string;
  user?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface AuditLogResult {
  logs: IAuditLog[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

class AuditLogService {
  private isEnabled: boolean;
  private exemptedActions: Set<string>;

  constructor() {
    // Read from environment variable - defaults to true if not set
    this.isEnabled = process.env.LOG_AUDIT !== 'false';
    
    // Initialize exempted actions from environment or default set
    const exemptedActionsEnv = process.env.AUDIT_EXEMPTED_ACTIONS || '';
    this.exemptedActions = new Set(
      exemptedActionsEnv 
        ? exemptedActionsEnv.split(',').map(action => action.trim())
        : []
    );

    logger.info('AuditLogService initialized', {
      enabled: this.isEnabled,
      exemptedActions: Array.from(this.exemptedActions)
    });
  }

  /**
   * Log an audit event
   */
  async log(
    action: string,
    user: string = 'SYSTEM',
    description: string,
    data?: any,
    options?: AuditLogOptions
  ): Promise<IAuditLog | null> {
    try {
      // Check if audit logging is disabled
      if (!this.isEnabled) {
        return null;
      }

      // Check if action is exempted
      if (this.exemptedActions.has(action)) {
        logger.debug('Audit log skipped for exempted action', { action, user });
        return null;
      }

      // Sanitize data to prevent storing sensitive information
      const sanitizedData = this.sanitizeData(data);

      const auditLog = new AuditLog({
        action,
        user,
        description,
        data: sanitizedData,
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        metadata: {
          environment: process.env.NODE_ENV || 'development',
          version: process.env.npm_package_version || '1.0.0',
          requestId: options?.requestId
        }
      });

      const savedLog = await auditLog.save();
      
      logger.debug('Audit log created', {
        id: savedLog._id.toString(),
        action,
        user,
        timestamp: savedLog.timestamp
      });

      return savedLog;
    } catch (error) {
      logger.error('Failed to create audit log', {
        error: error instanceof Error ? error.message : 'Unknown error',
        action,
        user,
        description
      });
      
      // Don't throw error to prevent audit logging from breaking the main application flow
      return null;
    }
  }

  /**
   * Log from Express request context
   */
  async logFromRequest(
    req: Request,
    action: string,
    description: string,
    data?: any,
    user?: string
  ): Promise<IAuditLog | null> {
    const userIdentifier = user || req?.user?.email || req?.user?.id || 'ANONYMOUS';
    const options: AuditLogOptions = {
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('User-Agent'),
      requestId: req?.headers['x-request-id'] as string
    };

    return this.log(action, userIdentifier, description, data, options);
  }

  /**
   * Query audit logs with filters and pagination
   */
  async query(queryOptions: AuditLogQuery): Promise<AuditLogResult> {
    try {
      const {
        action,
        user,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = queryOptions;

      // Build filter object
      const filter: any = {};
      
      if (action) {
        filter.action = { $regex: action, $options: 'i' }; // Case-insensitive partial match
      }
      
      if (user) {
        filter.user = { $regex: user, $options: 'i' }; // Case-insensitive partial match
      }
      
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = startDate;
        if (endDate) filter.timestamp.$lte = endDate;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const total = await AuditLog.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      // Execute query with pagination and sorting
      const logs = await AuditLog.find(filter)
        .sort({ timestamp: -1 }) // Most recent first
        .skip(skip)
        .limit(limit)
        .lean(); // Return plain objects instead of Mongoose documents for better performance

      return {
        logs: logs as IAuditLog[],
        total,
        page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      };
    } catch (error) {
      logger.error('Failed to query audit logs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        queryOptions
      });
      throw error;
    }
  }


  /**
   * Add an action to the exemption list
   */
  addExemptedAction(action: string): void {
    this.exemptedActions.add(action);
    logger.info('Action added to audit log exemption list', { action });
  }

  /**
   * Remove an action from the exemption list
   */
  removeExemptedAction(action: string): boolean {
    const removed = this.exemptedActions.delete(action);
    if (removed) {
      logger.info('Action removed from audit log exemption list', { action });
    }
    return removed;
  }

  /**
   * Get current exempted actions
   */
  getExemptedActions(): string[] {
    return Array.from(this.exemptedActions);
  }

  /**
   * Enable or disable audit logging
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    logger.info('Audit logging status changed', { enabled });
  }

  /**
   * Check if audit logging is enabled
   */
  isAuditEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Sanitize data to remove sensitive information
   */
  private sanitizeData(data: any): any {
    if (!data) return data;

    // If it's a string, object, or array, we need to sanitize it
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeData(item));
      } else {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(data)) {
          // Remove sensitive fields
          if (this.isSensitiveField(key)) {
            sanitized[key] = '[REDACTED]';
          } else {
            sanitized[key] = this.sanitizeData(value);
          }
        }
        return sanitized;
      }
    }

    return data;
  }

  /**
   * Check if a field name is sensitive and should be redacted
   */
  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'auth',
      'credential',
      'pin',
      'ssn',
      'social',
      'credit',
      'card',
      'cvv',
      'api_key',
      'apikey',
      'access_token',
      'refresh_token'
    ];

    const lowerFieldName = fieldName.toLowerCase();
    return sensitiveFields.some(sensitive => lowerFieldName.includes(sensitive));
  }
}

// Export singleton instance
export const auditLog = new AuditLogService();
