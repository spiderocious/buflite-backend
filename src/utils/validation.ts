/**
 * Validation Utilities
 * Comprehensive validation functions for common data types and formats
 */

/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Password validation
 * Requirements: min 8 chars, uppercase, lowercase, number
 */
export const isValidPassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;
  
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return minLength && hasUppercase && hasLowercase && hasNumber;
};

/**
 * Strong password validation
 * Requirements: min 12 chars, uppercase, lowercase, number, special char
 */
export const isStrongPassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;
  
  const minLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
};

/**
 * Phone number validation (international format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // International format: +[country code][number]
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * URL validation
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Date validation (YYYY-MM-DD format)
 */
export const isValidDate = (date: string): boolean => {
  if (!date || typeof date !== 'string') return false;
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
};

/**
 * Time validation (HH:MM format)
 */
export const isValidTime = (time: string): boolean => {
  if (!time || typeof time !== 'string') return false;
  
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * UUID validation
 */
export const isValidUUID = (uuid: string): boolean => {
  if (!uuid || typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * MongoDB ObjectId validation
 */
export const isValidObjectId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Credit card number validation (Luhn algorithm)
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  if (!cardNumber || typeof cardNumber !== 'string') return false;
  
  const cleanNumber = cardNumber.replace(/\s/g, '');
  const digitRegex = /^\d+$/;
  
  if (!digitRegex.test(cleanNumber) || cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * JSON string validation
 */
export const isValidJSON = (jsonString: string): boolean => {
  if (!jsonString || typeof jsonString !== 'string') return false;
  
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

/**
 * IP address validation (IPv4 and IPv6)
 */
export const isValidIP = (ip: string): boolean => {
  if (!ip || typeof ip !== 'string') return false;
  
  // IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(ip)) return true;
  
  // IPv6 validation (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  const ipv6CompressedRegex = /^((?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?)::((?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?)$/;
  
  return ipv6Regex.test(ip) || ipv6CompressedRegex.test(ip);
};

/**
 * Alphanumeric validation
 */
export const isAlphanumeric = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(str);
};

/**
 * Username validation (alphanumeric, underscore, hyphen)
 */
export const isValidUsername = (username: string): boolean => {
  if (!username || typeof username !== 'string') return false;
  
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * File extension validation
 */
export const hasValidExtension = (filename: string, allowedExtensions: string[]): boolean => {
  if (!filename || typeof filename !== 'string') return false;
  if (!allowedExtensions || !Array.isArray(allowedExtensions)) return false;
  
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.map(ext => ext.toLowerCase()).includes(extension) : false;
};

/**
 * Numeric range validation
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
};

/**
 * String length validation
 */
export const isValidLength = (str: string, min: number, max: number): boolean => {
  if (!str || typeof str !== 'string') return false;
  return str.length >= min && str.length <= max;
};

/**
 * Array validation
 */
export const isNonEmptyArray = (arr: any): boolean => {
  return Array.isArray(arr) && arr.length > 0;
};

/**
 * Object validation
 */
export const isNonEmptyObject = (obj: any): boolean => {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length > 0;
};

/**
 * Sanitization functions
 */
export const sanitizers = {
  /**
   * Remove HTML tags
   */
  stripHtml: (str: string): string => {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '');
  },

  /**
   * Normalize email
   */
  normalizeEmail: (email: string): string => {
    if (!email || typeof email !== 'string') return '';
    return email.trim().toLowerCase();
  },

  /**
   * Normalize phone number
   */
  normalizePhoneNumber: (phone: string): string => {
    if (!phone || typeof phone !== 'string') return '';
    return phone.replace(/[^\d+]/g, '');
  },

  /**
   * Trim and normalize whitespace
   */
  normalizeString: (str: string): string => {
    if (!str || typeof str !== 'string') return '';
    return str.trim().replace(/\s+/g, ' ');
  },

  /**
   * Remove special characters
   */
  alphanumericOnly: (str: string): string => {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[^a-zA-Z0-9]/g, '');
  }
};

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Comprehensive validator class
 */
export class Validator {
  private errors: string[] = [];

  /**
   * Reset validation errors
   */
  reset(): this {
    this.errors = [];
    return this;
  }

  /**
   * Add custom validation
   */
  custom(condition: boolean, message: string): this {
    if (!condition) {
      this.errors.push(message);
    }
    return this;
  }

  /**
   * Validate required field
   */
  required(value: any, fieldName: string): this {
    if (value === null || value === undefined || value === '') {
      this.errors.push(`${fieldName} is required`);
    }
    return this;
  }

  /**
   * Validate email
   */
  email(value: string, fieldName: string = 'Email'): this {
    if (value && !isValidEmail(value)) {
      this.errors.push(`${fieldName} must be a valid email address`);
    }
    return this;
  }

  /**
   * Validate password
   */
  password(value: string, fieldName: string = 'Password'): this {
    if (value && !isValidPassword(value)) {
      this.errors.push(`${fieldName} must be at least 8 characters with uppercase, lowercase, and number`);
    }
    return this;
  }

  /**
   * Get validation result
   */
  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors]
    };
  }
}

/**
 * Quick validation functions
 */
export const validate = {
  email: (email: string) => new Validator().email(email).getResult(),
  password: (password: string) => new Validator().password(password).getResult(),
  required: (value: any, fieldName: string) => new Validator().required(value, fieldName).getResult(),
};
