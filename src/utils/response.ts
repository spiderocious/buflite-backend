import { Response } from 'express';

/**
 * Unified Response Utilities
 * Consistent response formatting across the entire application
 * Based on BodyGuard backend's simple and effective response pattern
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: string;
}

/**
 * Base response function
 */
const createResponse = <T = any>(
  success: boolean,
  statusCode: number,
  message?: string,
  data?: T,
  error?: string
): ApiResponse<T> => {
  return {
    success,
    statusCode,
    message,
    data,
    error,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Success Response - 200 OK
 * @param res Express response object
 * @param message Success message
 * @param data Response data (optional)
 */
export const SuccessResponse = <T = any>(
  res: Response,
  message: string = 'Success',
  data?: T
): Response => {
  return res.status(200).json(createResponse(true, 200, message, data));
};

/**
 * Created Response - 201 Created
 * @param res Express response object
 * @param message Success message
 * @param data Response data (optional)
 */
export const CreatedResponse = <T = any>(
  res: Response,
  message: string = 'Resource created successfully',
  data?: T
): Response => {
  return res.status(201).json(createResponse(true, 201, message, data));
};

/**
 * No Content Response - 204 No Content
 * @param res Express response object
 * @param message Success message (optional)
 */
export const NoContentResponse = (
  res: Response,
  message: string = 'No content'
): Response => {
  return res.status(204).json(createResponse(true, 204, message));
};

/**
 * Bad Request Response - 400 Bad Request
 * @param res Express response object
 * @param message Error message
 * @param data Additional error data (optional)
 */
export const ErrorResponse = <T = any>(
  res: Response,
  message: string = 'Bad request',
  data?: T
): Response => {
  return res.status(400).json(createResponse(false, 400, undefined, data, message));
};

/**
 * Validation Error Response - 422 Unprocessable Entity
 * @param res Express response object
 * @param message Error message
 * @param errors Validation errors (optional)
 */
export const ValidationErrorResponse = <T = any>(
  res: Response,
  message: string = 'Validation failed',
  errors?: T
): Response => {
  return res.status(422).json(createResponse(false, 422, undefined, errors, message));
};

/**
 * Unauthorized Response - 401 Unauthorized
 * @param res Express response object
 * @param message Error message
 * @param data Additional error data (optional)
 */
export const UnauthorizedResponse = <T = any>(
  res: Response,
  message: string = 'Unauthorized',
  data?: T
): Response => {
  return res.status(401).json(createResponse(false, 401, undefined, data, message));
};

/**
 * Forbidden Response - 403 Forbidden
 * @param res Express response object
 * @param message Error message
 * @param data Additional error data (optional)
 */
export const ForbiddenResponse = <T = any>(
  res: Response,
  message: string = 'Forbidden',
  data?: T
): Response => {
  return res.status(403).json(createResponse(false, 403, undefined, data, message));
};

/**
 * Not Found Response - 404 Not Found
 * @param res Express response object
 * @param message Error message
 * @param data Additional error data (optional)
 */
export const NotFoundResponse = <T = any>(
  res: Response,
  message: string = 'Resource not found',
  data?: T
): Response => {
  return res.status(404).json(createResponse(false, 404, undefined, data, message));
};

/**
 * Conflict Response - 409 Conflict
 * @param res Express response object
 * @param message Error message
 * @param data Additional error data (optional)
 */
export const ConflictResponse = <T = any>(
  res: Response,
  message: string = 'Resource conflict',
  data?: T
): Response => {
  return res.status(409).json(createResponse(false, 409, undefined, data, message));
};

/**
 * Too Many Requests Response - 429 Too Many Requests
 * @param res Express response object
 * @param message Error message
 * @param retryAfter Retry after seconds (optional)
 */
export const TooManyRequestsResponse = (
  res: Response,
  message: string = 'Too many requests',
  retryAfter?: number
): Response => {
  if (retryAfter) {
    res.set('Retry-After', retryAfter.toString());
  }
  return res.status(429).json(createResponse(false, 429, undefined, undefined, message));
};

/**
 * Internal Server Error Response - 500 Internal Server Error
 * @param res Express response object
 * @param message Error message
 * @param data Additional error data (optional)
 */
export const InternalServerErrorResponse = <T = any>(
  res: Response,
  message: string = 'Internal server error',
  data?: T
): Response => {
  return res.status(500).json(createResponse(false, 500, undefined, data, message));
};

/**
 * Service Unavailable Response - 503 Service Unavailable
 * @param res Express response object
 * @param message Error message
 * @param retryAfter Retry after seconds (optional)
 */
export const ServiceUnavailableResponse = (
  res: Response,
  message: string = 'Service unavailable',
  retryAfter?: number
): Response => {
  if (retryAfter) {
    res.set('Retry-After', retryAfter.toString());
  }
  return res.status(503).json(createResponse(false, 503, undefined, undefined, message));
};

/**
 * Generic Response - Custom status code
 * @param res Express response object
 * @param statusCode HTTP status code
 * @param success Success flag
 * @param message Response message
 * @param data Response data (optional)
 */
export const GenericResponse = <T = any>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T
): Response => {
  return res.status(statusCode).json(createResponse(success, statusCode, message, data));
};

// Legacy aliases for backward compatibility (if needed)
export const BadRequestResponse = ErrorResponse;
export const ServerErrorResponse = InternalServerErrorResponse;

// Export all response functions as a group
export const ResponseUtils = {
  SuccessResponse,
  CreatedResponse,
  NoContentResponse,
  ErrorResponse,
  ValidationErrorResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  NotFoundResponse,
  ConflictResponse,
  TooManyRequestsResponse,
  InternalServerErrorResponse,
  ServiceUnavailableResponse,
  GenericResponse,
  BadRequestResponse,
  ServerErrorResponse,
};

export default ResponseUtils;
