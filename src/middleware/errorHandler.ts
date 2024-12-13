import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { config } from '@/config';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServiceError,
  DatabaseError,
  ExternalServiceError,
  handleMongooseError,
  RequestError,
} from '@/utils/errors';
import {
  ValidationErrorResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  NotFoundResponse,
  ConflictResponse,
  TooManyRequestsResponse,
  ServiceUnavailableResponse,
  InternalServerErrorResponse,
} from '@/utils/response';

/**
 * Error Handler Middleware
 * Comprehensive error handling with proper logging and consistent responses
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip if response already sent
  if (res.headersSent) {
    return next(error);
  }

  let appError: AppError;

  // Handle known error types
  if (error instanceof AppError) {
    appError = error;
  } else if (error.name === 'ValidationError' || error.name === 'MongoError' || error.name === 'CastError') {
    // Mongoose/MongoDB errors
    appError = handleMongooseError(error);
  } else if (error.name === 'JsonWebTokenError') {
    appError = new AuthenticationError('Invalid token');
  } else if (error.name === 'TokenExpiredError') {
    appError = new AuthenticationError('Token expired');
  } else if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    appError = new ValidationError('Invalid JSON payload');
  } else {
    // Unknown error - log it and create generic error
    logger.error('💥 Unknown error:', {
      message: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    appError = new AppError(
      config.app.env === 'production' ? 'Internal server error' : error.message,
      500
    );
  }

  // Log operational errors (expected errors)
  if (appError.isOperational) {
    logger.warn('⚠️ Operational error:', {
      error: appError.name,
      message: appError.message,
      statusCode: appError.statusCode,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  } else {
    // Log programming errors (unexpected errors)
    logger.error('💥 Programming error:', {
      error: appError.name,
      message: appError.message,
      stack: appError.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  }

  // Send appropriate response based on error type
  sendErrorResponse(res, appError);
};

/**
 * Send error response based on error type
 */
const sendErrorResponse = (res: Response, error: AppError): void => {
  switch (error.constructor) {
    case ValidationError:
      const validationError = error as ValidationError;
      ValidationErrorResponse(res, validationError.message, validationError.errors);
      break;

    case AuthenticationError:
      UnauthorizedResponse(res, error.message);
      break;

    case AuthorizationError:
      ForbiddenResponse(res, error.message);
      break;

    case NotFoundError:
      NotFoundResponse(res, error.message);
      break;
    
    case RequestError:
      ValidationErrorResponse(res, error.message);
      break;

    case ConflictError:
      ConflictResponse(res, error.message);
      break;

    case RateLimitError:
      const rateLimitError = error as RateLimitError;
      TooManyRequestsResponse(res, rateLimitError.message, rateLimitError.retryAfter);
      break;

    case ServiceError:
      const serviceError = error as ServiceError;
      ServiceUnavailableResponse(res, serviceError.message, serviceError.retryAfter);
      break;

    case DatabaseError:
    case ExternalServiceError:
    default:
      InternalServerErrorResponse(res, error.message);
      break;
  }
};

/**
 * 404 Handler Middleware
 * Handles requests to undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`);
  next(error);
};

/**
 * Async Handler Wrapper
 * Catches async errors and passes them to error middleware
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Development Error Handler
 * Shows stack trace and additional details in development
 */
export const developmentErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip if response already sent
  if (res.headersSent) {
    return next(error);
  }

  logger.error('💥 Development Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers,
  });

  const statusCode = error.statusCode || error.status || 500;
  
  res.status(statusCode).json({
    success: false,
    error: error.message || 'Internal server error',
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(config.app.env === 'development' && {
      stack: error.stack,
      details: {
        body: req.body,
        params: req.params,
        query: req.query,
      }
    }),
  });
};

/**
 * Unhandled Promise Rejection Handler
 */
export const handleUnhandledRejection = (reason: any, promise: Promise<any>): void => {
  logger.error('💥 Unhandled Promise Rejection:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
  });

  // Exit gracefully
  process.exit(1);
};

/**
 * Uncaught Exception Handler
 */
export const handleUncaughtException = (error: Error): void => {
  logger.error('💥 Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
  });

  // Exit immediately
  process.exit(1);
};

/**
 * Graceful Shutdown Handler
 */
export const handleGracefulShutdown = (signal: string, server?: any): void => {
  logger.info(`📴 ${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(() => {
      logger.info('✅ Server closed successfully');
      process.exit(0);
    });

    // Force close after timeout
    setTimeout(() => {
      logger.error('❌ Force closing server');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

/**
 * Express Error Handler Setup
 * Call this to set up all error handlers for Express app
 */
export const setupErrorHandlers = (app: any): void => {
  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Error handler middleware
  if (config.app.env === 'development') {
    app.use(developmentErrorHandler);
  } else {
    app.use(errorHandler);
  }
};

/**
 * Process Error Handler Setup
 * Call this to set up process-level error handlers
 */
export const setupProcessHandlers = (server?: any): void => {
  // Unhandled promise rejections
  process.on('unhandledRejection', handleUnhandledRejection);

  // Uncaught exceptions
  process.on('uncaughtException', handleUncaughtException);

  // Graceful shutdown signals
  process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM', server));
  process.on('SIGINT', () => handleGracefulShutdown('SIGINT', server));
  process.on('SIGUSR2', () => handleGracefulShutdown('SIGUSR2', server)); // nodemon restart
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  developmentErrorHandler,
  setupErrorHandlers,
  setupProcessHandlers,
};
