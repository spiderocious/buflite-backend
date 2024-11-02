import { Request, Response, NextFunction } from 'express';
import { UnauthorizedResponse } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Middleware to validate internal API token for admin endpoints
 * Token should be passed in Authorization header as "Bearer <token>"
 * or in x-internal-token header
 */
export const validateInternalToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const internalToken = process.env.INTERNAL_API_TOKEN;
    
    if (!internalToken) {
      logger.error('INTERNAL_API_TOKEN not configured in environment');
      UnauthorizedResponse(res, 'Internal API not properly configured');
      return;
    }

    // Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    let providedToken: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      providedToken = authHeader.substring(7);
    } else {
      // Check x-internal-token header as fallback
      providedToken = req.headers['x-internal-token'] as string;
    }

    if (!providedToken) {
      logger.warn('Internal API access attempted without token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      });
      UnauthorizedResponse(res, 'Internal API token required');
      return;
    }

    if (providedToken !== internalToken) {
      logger.warn('Internal API access attempted with invalid token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        providedTokenPrefix: providedToken.substring(0, 8) + '...'
      });
      UnauthorizedResponse(res, 'Invalid internal API token');
      return;
    }

    logger.info('Internal API access granted', {
      ip: req.ip,
      path: req.path
    });

    next();
  } catch (error) {
    logger.error('Error in internal token validation', error);
    UnauthorizedResponse(res, 'Internal authentication error');
  }
};
