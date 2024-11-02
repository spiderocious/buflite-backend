import { Request, Response, NextFunction } from 'express';
import { SuccessResponse, ValidationErrorResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { auditLog, AuditLogQuery } from '../services/auditLog.service';
import { logger } from '../utils/logger';

export class AuditLogController {
  /**
   * Get audit logs with optional filters
   */
  static getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        action,
        user,
        startDate,
        endDate,
        page = '1',
        limit = '50'
      } = req.query as Record<string, string>;

      // Validate and parse query parameters
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        throw new ValidationError('Page must be a positive number');
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new ValidationError('Limit must be a number between 1 and 100');
      }

      // Parse dates if provided
      let parsedStartDate: Date | undefined;
      let parsedEndDate: Date | undefined;

      if (startDate) {
        parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate.getTime())) {
          throw new ValidationError('Invalid startDate format. Use ISO 8601 format');
        }
      }

      if (endDate) {
        parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          throw new ValidationError('Invalid endDate format. Use ISO 8601 format');
        }
      }

      // Validate date range
      if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
        throw new ValidationError('startDate cannot be after endDate');
      }

      const queryOptions: AuditLogQuery = {
        action: action || undefined,
        user: user || undefined,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        page: pageNum,
        limit: limitNum
      };

      const result = await auditLog.query(queryOptions);

      // Log the audit log access
      await auditLog.logFromRequest(
        req,
        'AUDIT_LOGS_ACCESSED',
        'Audit logs were accessed via API',
        {
          filters: queryOptions,
          resultCount: result.logs.length
        }
      );

      SuccessResponse(res, 'Audit logs retrieved successfully', {
        ...result,
        filters: {
          action: action || null,
          user: user || null,
          startDate: startDate || null,
          endDate: endDate || null
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get audit log statistics
   */
  static getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { days = '30' } = req.query as Record<string, string>;

      const daysNum = parseInt(days, 10);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        throw new ValidationError('Days must be a number between 1 and 365');
      }

      const stats = await auditLog.getStats(daysNum);

      // Log the audit log stats access
      await auditLog.logFromRequest(
        req,
        'AUDIT_STATS_ACCESSED',
        'Audit log statistics were accessed via API',
        { days: daysNum }
      );

      SuccessResponse(res, 'Audit log statistics retrieved successfully', {
        ...stats,
        period: {
          days: daysNum,
          startDate: new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get audit service configuration
   */
  static getConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = {
        enabled: auditLog.isAuditEnabled(),
        exemptedActions: auditLog.getExemptedActions()
      };

      // Log the audit config access
      await auditLog.logFromRequest(
        req,
        'AUDIT_CONFIG_ACCESSED',
        'Audit log configuration was accessed via API'
      );

      SuccessResponse(res, 'Audit log configuration retrieved successfully', config);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update audit service configuration
   */
  static updateConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { enabled, exemptedActions } = req.body;

      const changes: any = {};

      // Update enabled status if provided
      if (typeof enabled === 'boolean') {
        const oldEnabled = auditLog.isAuditEnabled();
        auditLog.setEnabled(enabled);
        changes.enabled = { from: oldEnabled, to: enabled };
      }

      // Update exempted actions if provided
      if (Array.isArray(exemptedActions)) {
        const oldExemptedActions = auditLog.getExemptedActions();
        
        // Clear current exempted actions and add new ones
        oldExemptedActions.forEach(action => auditLog.removeExemptedAction(action));
        exemptedActions.forEach((action: string) => {
          if (typeof action === 'string') {
            auditLog.addExemptedAction(action);
          }
        });

        changes.exemptedActions = {
          from: oldExemptedActions,
          to: auditLog.getExemptedActions()
        };
      }

      // Log the configuration change
      await auditLog.logFromRequest(
        req,
        'AUDIT_CONFIG_UPDATED',
        'Audit log configuration was updated via API',
        changes
      );

      const updatedConfig = {
        enabled: auditLog.isAuditEnabled(),
        exemptedActions: auditLog.getExemptedActions()
      };

      SuccessResponse(res, 'Audit log configuration updated successfully', {
        config: updatedConfig,
        changes
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get unique actions from audit logs
   */
  static getActions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { days = '30' } = req.query as Record<string, string>;

      const daysNum = parseInt(days, 10);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        throw new ValidationError('Days must be a number between 1 and 365');
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysNum);

      // Get unique actions from the specified period
      const actions = await auditLog.query({
        startDate,
        page: 1,
        limit: 1000 // Get a large number to capture all unique actions
      });

      const uniqueActions = [...new Set(actions.logs.map(log => log.action))].sort();

      // Log the audit actions access
      await auditLog.logFromRequest(
        req,
        'AUDIT_ACTIONS_ACCESSED',
        'Audit log actions list was accessed via API',
        { days: daysNum, actionsCount: uniqueActions.length }
      );

      SuccessResponse(res, 'Audit log actions retrieved successfully', {
        actions: uniqueActions,
        count: uniqueActions.length,
        period: {
          days: daysNum,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get unique users from audit logs
   */
  static getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { days = '30' } = req.query as Record<string, string>;

      const daysNum = parseInt(days, 10);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        throw new ValidationError('Days must be a number between 1 and 365');
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysNum);

      // Get unique users from the specified period
      const logs = await auditLog.query({
        startDate,
        page: 1,
        limit: 1000 // Get a large number to capture all unique users
      });

      const uniqueUsers = [...new Set(logs.logs.map(log => log.user))].sort();

      // Log the audit users access
      await auditLog.logFromRequest(
        req,
        'AUDIT_USERS_ACCESSED',
        'Audit log users list was accessed via API',
        { days: daysNum, usersCount: uniqueUsers.length }
      );

      SuccessResponse(res, 'Audit log users retrieved successfully', {
        users: uniqueUsers,
        count: uniqueUsers.length,
        period: {
          days: daysNum,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
