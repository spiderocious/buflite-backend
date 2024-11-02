import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { JWTUtils } from '../utils/jwt';
import { TooManyRequestsResponse } from '../utils/response';

/**
 * Authentication Middleware
 * Comprehensive JWT-based authentication system
 */

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
      token?: string;
    }
  }
}

/**
 * Main authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);
    
    if (!token) {
      logger.warn('Authentication attempted without token', {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
      });
      throw new AuthenticationError('Access token required');
    }

    // Verify JWT token
    const verifyResult = JWTUtils.verifyAccessToken(token);
    
    if (!verifyResult.valid) {
      logger.warn('Invalid token provided', {
        error: verifyResult.error,
        expired: verifyResult.expired,
        url: req.originalUrl,
        ip: req.ip,
      });
      
      if (verifyResult.expired) {
        throw new AuthenticationError('Token has expired');
      }
      throw new AuthenticationError('Invalid access token');
    }

    if (!verifyResult.payload) {
      throw new AuthenticationError('Invalid token payload');
    }
    // TODO: Replace with actual database lookup
    const user = {
      id: verifyResult.payload.userId,
      email: verifyResult.payload.email,
      role: verifyResult.payload.role,
      status: 'active',
      emailVerified: true
    };

    // Attach user and token info to request
    req.user = user;
    req.userId = user.id;
    req.token = token;

    logger.debug('User authenticated successfully', {
      userId: user.id,
      email: user.email,
      role: user.role,
      url: req.originalUrl,
    });

    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is provided, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);
    
    if (!token) {
      return next();
    }

    // Verify token if provided
    const verifyResult = JWTUtils.verifyAccessToken(token);
    
    if (verifyResult.valid && verifyResult.payload) {
      // Create mock user from token
      const user = {
        id: verifyResult.payload.userId,
        email: verifyResult.payload.email,
        role: verifyResult.payload.role,
        status: 'active',
        emailVerified: true
      };
      
      req.user = user;
      req.userId = user.id;
      req.token = token;
    }

    next();
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    // Don't throw error for optional auth, just continue
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (allowedRoles: string | string[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        logger.warn('Authorization failed - insufficient role', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: roles,
          url: req.originalUrl,
        });
        throw new AuthorizationError(`Access denied. Required role: ${roles.join(' or ')}`);
      }

      logger.debug('Authorization successful', {
        userId: req.user.id,
        role: req.user.role,
        url: req.originalUrl,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * User or Admin middleware
 */
export const requireUserOrAdmin = requireRole(['user', 'admin']);

/**
 * Require user to be the owner of the resource or admin
 */
export const requireOwnershipOrAdmin = (getUserIdFromParams: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const resourceUserId = getUserIdFromParams(req);
      
      // Allow if user is admin or owns the resource
      if (req.user.role === 'admin' || req.user.id === resourceUserId) {
        return next();
      }

      logger.warn('Authorization failed - not owner or admin', {
        userId: req.user.id,
        userRole: req.user.role,
        resourceUserId,
        url: req.originalUrl,
      });

      throw new AuthorizationError('Access denied. You can only access your own resources');
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user account is verified
 */
export const requireVerified = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (!req.user.emailVerified) {
      logger.warn('Access attempted with unverified account', {
        userId: req.user.id,
        email: req.user.email,
        url: req.originalUrl,
      });
      throw new AuthenticationError('Account email verification required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Rate limiting middleware (basic implementation)
 */
export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userId = req.user?.id || req.ip;
      const now = Date.now();

      const userLimit = userRequests.get(userId);
      
      if (!userLimit || now > userLimit.resetTime) {
        userRequests.set(userId, {
          count: 1,
          resetTime: now + windowMs
        });
        return next();
      }

      if (userLimit.count >= maxRequests) {
        logger.warn('Rate limit exceeded', {
          userId: req.user?.id,
          ip: req.ip,
          count: userLimit.count,
          maxRequests,
          url: req.originalUrl,
        });
        
        TooManyRequestsResponse(res, 'Too many requests. Please try again later.');
        return;
      }

      userLimit.count++;
      next();
    } catch (error) {
      next(error);
    }
  };
};
