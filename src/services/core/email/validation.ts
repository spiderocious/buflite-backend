/**
 * Email Validation Utilities
 * Provides email validation functions and utilities
 */

import { AppError } from '../../../utils/errors';

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
}

export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly COMMON_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'aol.com', 'live.com', 'msn.com', 'protonmail.com', 'mail.com'
  ];

  /**
   * Basic email format validation
   */
  static isValidFormat(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    return EmailValidator.EMAIL_REGEX.test(email.trim().toLowerCase());
  }

  /**
   * Comprehensive email validation
   */
  static validate(email: string): EmailValidationResult {
    if (!email || typeof email !== 'string') {
      return {
        isValid: false,
        error: 'Email is required',
      };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Basic format check
    if (!EmailValidator.EMAIL_REGEX.test(trimmedEmail)) {
      return {
        isValid: false,
        error: 'Invalid email format',
      };
    }

    // Length checks
    if (trimmedEmail.length > 254) {
      return {
        isValid: false,
        error: 'Email address is too long',
      };
    }

    const [localPart, domain] = trimmedEmail.split('@');

    // Local part checks
    if (localPart.length > 64) {
      return {
        isValid: false,
        error: 'Email local part is too long',
      };
    }

    // Domain checks
    if (domain.length > 253) {
      return {
        isValid: false,
        error: 'Email domain is too long',
      };
    }

    // Check for consecutive dots
    if (trimmedEmail.includes('..')) {
      return {
        isValid: false,
        error: 'Email cannot contain consecutive dots',
      };
    }

    // Check for domain suggestions
    const suggestions = EmailValidator.getSuggestions(domain);

    return {
      isValid: true,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Validate multiple email addresses
   */
  static validateMultiple(emails: string[]): EmailValidationResult[] {
    return emails.map(email => EmailValidator.validate(email));
  }

  /**
   * Check if all emails in array are valid
   */
  static areAllValid(emails: string[]): boolean {
    return emails.every(email => EmailValidator.isValidFormat(email));
  }

  /**
   * Filter valid emails from array
   */
  static filterValid(emails: string[]): string[] {
    return emails.filter(email => EmailValidator.isValidFormat(email));
  }

  /**
   * Get domain suggestions for common typos
   */
  private static getSuggestions(domain: string): string[] {
    const suggestions: string[] = [];
    
    // Common typos for popular domains
    const typoMap: Record<string, string> = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmail.co': 'gmail.com',
      'yaho.com': 'yahoo.com',
      'yahoomail.com': 'yahoo.com',
      'hotmai.com': 'hotmail.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'outloo.com': 'outlook.com',
    };

    if (typoMap[domain]) {
      suggestions.push(typoMap[domain]);
    }

    return suggestions;
  }

  /**
   * Normalize email address
   */
  static normalize(email: string): string {
    if (!EmailValidator.isValidFormat(email)) {
      throw new AppError('Cannot normalize invalid email address', 400);
    }

    return email.trim().toLowerCase();
  }

  /**
   * Extract domain from email
   */
  static getDomain(email: string): string {
    if (!EmailValidator.isValidFormat(email)) {
      throw new AppError('Cannot extract domain from invalid email', 400);
    }

    return email.split('@')[1].toLowerCase();
  }

  /**
   * Check if email is from a disposable email provider
   */
  static isDisposable(email: string): boolean {
    const domain = EmailValidator.getDomain(email);
    const disposableDomains = [
      '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
      'tempmail.org', 'throwaway.email', 'temp-mail.org'
    ];
    
    return disposableDomains.includes(domain);
  }

  /**
   * Check if email is from a business domain (not personal)
   */
  static isBusinessEmail(email: string): boolean {
    const domain = EmailValidator.getDomain(email);
    return !EmailValidator.COMMON_DOMAINS.includes(domain);
  }
}

// Export convenience functions
export const isValidEmail = (email: string): boolean => EmailValidator.isValidFormat(email);
export const validateEmail = (email: string): EmailValidationResult => EmailValidator.validate(email);
export const normalizeEmail = (email: string): string => EmailValidator.normalize(email);

export default EmailValidator;
