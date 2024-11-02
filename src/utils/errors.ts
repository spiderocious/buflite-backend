/**
 * Custom Error Classes
 * Based on DayTracker's sophisticated error handling with BodyGuard's simplicity
 */

/**
 * Base Application Error class
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(
    message: string, 
    statusCode: number = 500, 
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error - 400 Bad Request
 */
export class ValidationError extends AppError {
  public errors: ValidationFieldError[];

  constructor(
    message: string, 
    errors: ValidationFieldError[] = []
  ) {
    super(message, 400);
    this.errors = errors.length > 0 ? errors : [
      {
        field: 'general',
        message: message,
        value: null,
      }
    ];
    this.name = 'ValidationError';
  }
}


export class RequestError extends AppError {
  constructor(message: string = 'Request failed') {
    super(message, 400);
    this.name = 'RequestError';
  }
}

export interface ValidationFieldError {
  field: string;
  message: string;
  value: any;
}

/**
 * Authentication Error - 401 Unauthorized
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error - 403 Forbidden
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error - 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error - 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error - 429 Too Many Requests
 */
export class RateLimitError extends AppError {
  public retryAfter?: number;

  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(message, 429);
    this.retryAfter = retryAfter;
    this.name = 'RateLimitError';
  }
}

/**
 * Service Error - 503 Service Unavailable
 */
export class ServiceError extends AppError {
  public retryAfter?: number;

  constructor(message: string = 'Service unavailable', retryAfter?: number) {
    super(message, 503);
    this.retryAfter = retryAfter;
    this.name = 'ServiceError';
  }
}

/**
 * Database Error - 500 Internal Server Error
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

/**
 * External Service Error - 502 Bad Gateway
 */
export class ExternalServiceError extends AppError {
  public service: string;

  constructor(message: string, service: string = 'external') {
    super(message, 502);
    this.service = service;
    this.name = 'ExternalServiceError';
  }
}

/**
 * Async Handler Wrapper
 * Automatically catches async errors and passes them to error middleware
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error Helper Functions
 */
export const createValidationError = (
  field: string, 
  message: string, 
  value?: any
): ValidationError => {
  return new ValidationError('Validation failed', [
    { field, message, value }
  ]);
};

export const createMultipleValidationErrors = (
  errors: ValidationFieldError[]
): ValidationError => {
  return new ValidationError('Multiple validation errors', errors);
};

/**
 * MongoDB/Mongoose Error Handlers
 */
export const handleMongooseError = (error: any): AppError => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));
    return new ValidationError('Validation failed', errors);
  }

  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      const value = error.keyValue?.[field];
      return new ConflictError(
        `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`
      );
    }
    return new DatabaseError('Database operation failed');
  }

  if (error.name === 'CastError') {
    return new ValidationError(`Invalid ${error.path}: ${error.value}`);
  }

  return new AppError(error.message || 'Unknown error', 500);
};

/**
 * HTTP Error Handlers
 */
export const handleHttpError = (statusCode: number, message?: string): AppError => {
  switch (statusCode) {
    case 400:
      return new ValidationError(message || 'Bad request');
    case 401:
      return new AuthenticationError(message || 'Unauthorized');
    case 403:
      return new AuthorizationError(message || 'Forbidden');
    case 404:
      return new NotFoundError(message || 'Not found');
    case 409:
      return new ConflictError(message || 'Conflict');
    case 429:
      return new RateLimitError(message || 'Too many requests');
    case 503:
      return new ServiceError(message || 'Service unavailable');
    default:
      return new AppError(message || 'Internal server error', statusCode);
  }
};

/**
 * Export all error classes and utilities
 */
export {
  AppError as default,
};

export const ErrorUtils = {
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
  asyncHandler,
  createValidationError,
  createMultipleValidationErrors,
  handleMongooseError,
  handleHttpError,
};
