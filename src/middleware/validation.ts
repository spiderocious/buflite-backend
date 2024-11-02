import { Request, Response, NextFunction } from 'express';
import { ValidationError, createMultipleValidationErrors } from '@/utils/errors';
import { logger } from '@/utils/logger';

/**
 * Validation Middleware
 * Provides request validation utilities and middleware functions
 */

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationSchema {
  body?: ValidationRule[];
  params?: ValidationRule[];
  query?: ValidationRule[];
}

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate a single field
 */
const validateField = (
  value: any,
  rule: ValidationRule,
  fieldPath: string = rule.field
): { isValid: boolean; message?: string } => {
  // Check required
  if (rule.required && (value === undefined || value === null || value === '')) {
    return {
      isValid: false,
      message: rule.message || `${fieldPath} is required`,
    };
  }

  // Skip other validations if field is not required and empty
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return { isValid: true };
  }

  // Type validation
  if (rule.type) {
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          return {
            isValid: false,
            message: rule.message || `${fieldPath} must be a string`,
          };
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return {
            isValid: false,
            message: rule.message || `${fieldPath} must be a valid number`,
          };
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          return {
            isValid: false,
            message: rule.message || `${fieldPath} must be a boolean`,
          };
        }
        break;

      case 'email':
        if (typeof value !== 'string' || !EMAIL_REGEX.test(value)) {
          return {
            isValid: false,
            message: rule.message || `${fieldPath} must be a valid email address`,
          };
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          return {
            isValid: false,
            message: rule.message || `${fieldPath} must be an array`,
          };
        }
        break;

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value) || value === null) {
          return {
            isValid: false,
            message: rule.message || `${fieldPath} must be an object`,
          };
        }
        break;
    }
  }

  // String length validation
  if (rule.type === 'string' && typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return {
        isValid: false,
        message: rule.message || `${fieldPath} must be at least ${rule.minLength} characters long`,
      };
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return {
        isValid: false,
        message: rule.message || `${fieldPath} must be no more than ${rule.maxLength} characters long`,
      };
    }
  }

  // Number range validation
  if (rule.type === 'number' && typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return {
        isValid: false,
        message: rule.message || `${fieldPath} must be at least ${rule.min}`,
      };
    }

    if (rule.max !== undefined && value > rule.max) {
      return {
        isValid: false,
        message: rule.message || `${fieldPath} must be no more than ${rule.max}`,
      };
    }
  }

  // Array length validation
  if (rule.type === 'array' && Array.isArray(value)) {
    if (rule.minLength && value.length < rule.minLength) {
      return {
        isValid: false,
        message: rule.message || `${fieldPath} must contain at least ${rule.minLength} items`,
      };
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return {
        isValid: false,
        message: rule.message || `${fieldPath} must contain no more than ${rule.maxLength} items`,
      };
    }
  }

  // Pattern validation
  if (rule.pattern && typeof value === 'string') {
    if (!rule.pattern.test(value)) {
      return {
        isValid: false,
        message: rule.message || `${fieldPath} format is invalid`,
      };
    }
  }

  // Custom validation
  if (rule.custom) {
    const customResult = rule.custom(value);
    if (customResult !== true) {
      return {
        isValid: false,
        message: typeof customResult === 'string' ? customResult : (rule.message || `${fieldPath} is invalid`),
      };
    }
  }

  return { isValid: true };
};

/**
 * Validate request data against schema
 */
const validateData = (
  data: any,
  rules: ValidationRule[],
  dataType: string
): { isValid: boolean; errors: any[] } => {
  const errors: any[] = [];

  for (const rule of rules) {
    const value = data[rule.field];
    const validation = validateField(value, rule, `${dataType}.${rule.field}`);

    if (!validation.isValid) {
      errors.push({
        field: rule.field,
        message: validation.message,
        value: value,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validation middleware factory
 */
export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const allErrors: any[] = [];

      // Validate body
      if (schema.body) {
        const bodyValidation = validateData(req.body || {}, schema.body, 'body');
        if (!bodyValidation.isValid) {
          allErrors.push(...bodyValidation.errors);
        }
      }

      // Validate params
      if (schema.params) {
        const paramsValidation = validateData(req.params || {}, schema.params, 'params');
        if (!paramsValidation.isValid) {
          allErrors.push(...paramsValidation.errors);
        }
      }

      // Validate query
      if (schema.query) {
        const queryValidation = validateData(req.query || {}, schema.query, 'query');
        if (!queryValidation.isValid) {
          allErrors.push(...queryValidation.errors);
        }
      }

      // If there are validation errors, throw ValidationError
      if (allErrors.length > 0) {
        logger.warn('Validation failed:', {
          errors: allErrors,
          url: req.originalUrl,
          method: req.method,
        });

        throw createMultipleValidationErrors(allErrors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Common validation schemas
 */
export const commonValidations = {
  // Pagination validation
  pagination: {
    query: [
      {
        field: 'page',
        type: 'string' as const,
        custom: (value: string) => {
          if (!value) return true;
          const num = parseInt(value);
          return !isNaN(num) && num > 0;
        },
        message: 'page must be a positive integer',
      },
      {
        field: 'limit',
        type: 'string' as const,
        custom: (value: string) => {
          if (!value) return true;
          const num = parseInt(value);
          return !isNaN(num) && num > 0 && num <= 100;
        },
        message: 'limit must be a positive integer between 1 and 100',
      },
    ],
  },

  // ID parameter validation
  mongoId: {
    params: [
      {
        field: 'id',
        required: true,
        type: 'string' as const,
        pattern: /^[0-9a-fA-F]{24}$/,
        message: 'id must be a valid MongoDB ObjectId',
      },
    ],
  },

  // User registration validation
  userRegistration: {
    body: [
      {
        field: 'email',
        required: true,
        type: 'email' as const,
        maxLength: 254,
      },
      {
        field: 'password',
        required: true,
        type: 'string' as const,
        minLength: 6,
        maxLength: 128,
      },
      {
        field: 'firstName',
        required: true,
        type: 'string' as const,
        minLength: 1,
        maxLength: 50,
      },
      {
        field: 'lastName',
        required: true,
        type: 'string' as const,
        minLength: 1,
        maxLength: 50,
      },
    ],
  },

  // User login validation
  userLogin: {
    body: [
      {
        field: 'email',
        required: true,
        type: 'email' as const,
      },
      {
        field: 'password',
        required: true,
        type: 'string' as const,
        minLength: 1,
      },
    ],
  },
};

/**
 * Quick validation helpers
 */
export const validateRequired = (fields: string[]) => {
  const rules: ValidationRule[] = fields.map(field => ({
    field,
    required: true,
  }));

  return validate({ body: rules });
};

export const validateEmail = (field: string = 'email') => {
  return validate({
    body: [
      {
        field,
        required: true,
        type: 'email',
      },
    ],
  });
};

export const validateMongoId = (field: string = 'id', location: 'params' | 'body' | 'query' = 'params') => {
  const rule: ValidationRule = {
    field,
    required: true,
    type: 'string',
    pattern: /^[0-9a-fA-F]{24}$/,
    message: `${field} must be a valid MongoDB ObjectId`,
  };

  return validate({ [location]: [rule] });
};

export default {
  validate,
  validateRequired,
  validateEmail,
  validateMongoId,
  commonValidations,
};
