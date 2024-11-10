import { randomBytes, randomUUID, createHash } from 'crypto';
import { customAlphabet } from 'nanoid';
import { normalizeContent } from './helpers';

/**
 * ID Generation Utilities
 * Provides various ID generation methods for different use cases
 */

/**
 * Generate a UUID v4
 */
export const generateUUID = (): string => {
  return randomUUID();
};

/**
 * Generate a short ID using nanoid
 * Default: 10 characters, URL-safe alphabet
 */
export const generateShortId = (length: number = 10): string => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
};

/**
 * Generate a numeric ID
 */
export const generateNumericId = (length: number = 8): string => {
  const alphabet = '0123456789';
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
};

/**
 * Generate an alphanumeric ID (uppercase)
 */
export const generateAlphanumericId = (length: number = 8): string => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
};

/**
 * Generate a secure token for sensitive operations
 */
export const generateSecureToken = (bytes: number = 32): string => {
  return randomBytes(bytes).toString('hex');
};

/**
 * Generate a user-friendly ID with prefix
 */
export const generatePrefixedId = (prefix: string, length: number = 8): string => {
  const id = generateAlphanumericId(length);
  return `${prefix.toUpperCase()}_${id}`;
};

/**
 * Generate a timestamp-based ID
 */
export const generateTimestampId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = generateShortId(6);
  return `${timestamp}_${random}`;
};

/**
 * Generate verification code (numeric)
 */
export const generateVerificationCode = (length: number = 6): string => {
  return generateNumericId(length);
};

/**
 * Generate API key
 */
export const generateApiKey = (): string => {
  const prefix = 'sk';
  const timestamp = Date.now().toString(36);
  const random = generateSecureToken(16);
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Generate database ID (MongoDB-style ObjectId format)
 */
export const generateObjectId = (): string => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = randomBytes(8).toString('hex');
  return timestamp + random;
};

/**
 * ID Generator class with configurable options
 */
export class IDGenerator {
  private prefix?: string;
  private length: number;
  private alphabet: string;

  constructor(options: {
    prefix?: string;
    length?: number;
    alphabet?: string;
  } = {}) {
    this.prefix = options.prefix;
    this.length = options.length || 10;
    this.alphabet = options.alphabet || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  }

  /**
   * Generate ID with configured options
   */
  generate(): string {
    const nanoid = customAlphabet(this.alphabet, this.length);
    const id = nanoid();
    return this.prefix ? `${this.prefix}_${id}` : id;
  }

  /**
   * Generate multiple IDs
   */
  generateBatch(count: number): string[] {
    return Array.from({ length: count }, () => this.generate());
  }
}

/**
 * Predefined ID generators for common use cases
 */
export const idGenerators = {
  user: new IDGenerator({ prefix: 'usr', length: 12 }),
  session: new IDGenerator({ prefix: 'sess', length: 16 }),
  token: new IDGenerator({ prefix: 'tok', length: 20 }),
  request: new IDGenerator({ prefix: 'req', length: 8 }),
  transaction: new IDGenerator({ prefix: 'txn', length: 16 }),
  file: new IDGenerator({ prefix: 'file', length: 12 }),
  job: new IDGenerator({ prefix: 'job', length: 10 }),
};

/**
 * Validate ID format
 */
export const validateId = (id: string, pattern?: RegExp): boolean => {
  if (!id || typeof id !== 'string') return false;
  
  if (pattern) {
    return pattern.test(id);
  }
  
  // Default validation: alphanumeric with optional prefix
  const defaultPattern = /^[a-zA-Z0-9_-]+$/;
  return defaultPattern.test(id);
};

/**
 * Common ID patterns
 */
export const ID_PATTERNS = {
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  OBJECT_ID: /^[0-9a-fA-F]{24}$/,
  NUMERIC: /^\d+$/,
  ALPHANUMERIC: /^[A-Z0-9]+$/,
  PREFIXED: /^[A-Z]+_[A-Z0-9]+$/,
} as const;

/**
 * Generate a cache key for content analysis
 * Creates a consistent MD5 hash from normalized content and platform
 */
export function generateCacheKey(content: string, platform: string): string {
  // Normalize content for consistent hashing
  const normalizedContent = normalizeContent(content);
  const input = `${normalizedContent}|${platform.toLowerCase()}`;

  return createHash('md5').update(input, 'utf8').digest('hex');
}
