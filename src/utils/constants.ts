/**
 * Application Constants
 * Centralized configuration and constant values
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  
  // Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

// Application Environment Types
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test'
} as const;

// Time Constants (in milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  DEFAULT_SORT: 'createdAt',
  DEFAULT_ORDER: 'desc' as 'asc' | 'desc'
} as const;

// Rate Limiting Configuration
export const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * TIME.MINUTE,
    MAX_REQUESTS: 100,
    MESSAGE: 'Too many requests from this IP, please try again later'
  },
  AUTH: {
    WINDOW_MS: 15 * TIME.MINUTE,
    MAX_REQUESTS: 5,
    MESSAGE: 'Too many authentication attempts, please try again later'
  },
  PASSWORD_RESET: {
    WINDOW_MS: TIME.HOUR,
    MAX_REQUESTS: 3,
    MESSAGE: 'Too many password reset attempts, please try again later'
  },
  EMAIL_VERIFICATION: {
    WINDOW_MS: TIME.HOUR,
    MAX_REQUESTS: 5,
    MESSAGE: 'Too many email verification attempts, please try again later'
  },
  API: {
    WINDOW_MS: TIME.MINUTE,
    MAX_REQUESTS: 60,
    MESSAGE: 'API rate limit exceeded, please try again later'
  }
} as const;

// User Roles and Permissions
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest'
} as const;

export const USER_PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  UPDATE: 'update',
  DELETE: 'delete',
  ADMIN: 'admin',
  MODERATE: 'moderate'
} as const;

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  BANNED: 'banned'
} as const;

// Authentication Constants
export const AUTH = {
  JWT: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    VERIFICATION_TOKEN_EXPIRY: '24h',
    PASSWORD_RESET_TOKEN_EXPIRY: '1h',
    ISSUER: 'backend-template',
    AUDIENCE: 'backend-template-users'
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    SALT_ROUNDS: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false
  },
  SESSION: {
    MAX_CONCURRENT_SESSIONS: 5,
    INACTIVITY_TIMEOUT: 30 * TIME.MINUTE,
    ABSOLUTE_TIMEOUT: 8 * TIME.HOUR
  }
} as const;

// Email Configuration
export const EMAIL = {
  TYPES: {
    WELCOME: 'welcome',
    EMAIL_VERIFICATION: 'email_verification',
    PASSWORD_RESET: 'password_reset',
    PASSWORD_CHANGED: 'password_changed',
    ACCOUNT_LOCKED: 'account_locked',
    LOGIN_ALERT: 'login_alert'
  },
  TEMPLATES: {
    WELCOME: 'welcome',
    VERIFICATION: 'email-verification',
    PASSWORD_RESET: 'password-reset',
    PASSWORD_CHANGED: 'password-changed'
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    BACKOFF_DELAY: 5 * TIME.SECOND
  }
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    GENERAL: 10 * 1024 * 1024 // 10MB
  },
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    GENERAL: ['text/plain', 'text/csv', 'application/json']
  },
  EXTENSIONS: {
    IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    DOCUMENTS: ['.pdf', '.doc', '.docx'],
    SPREADSHEETS: ['.xls', '.xlsx'],
    GENERAL: ['.txt', '.csv', '.json']
  }
} as const;

// Database Constants
export const DATABASE = {
  CONNECTION: {
    MAX_POOL_SIZE: 10,
    MIN_POOL_SIZE: 2,
    MAX_IDLE_TIME: 30000,
    CONNECTION_TIMEOUT: 30000,
    QUERY_TIMEOUT: 30000
  },
  INDEXES: {
    TEXT_SEARCH_SCORE_THRESHOLD: 0.75,
    COMPOUND_INDEX_LIMIT: 32
  },
  OPERATIONS: {
    MAX_BATCH_SIZE: 1000,
    DEFAULT_BATCH_SIZE: 100
  }
} as const;

// Caching Constants
export const CACHE = {
  TTL: {
    SHORT: 5 * TIME.MINUTE,
    MEDIUM: 30 * TIME.MINUTE,
    LONG: 2 * TIME.HOUR,
    VERY_LONG: 24 * TIME.HOUR
  },
  KEYS: {
    USER_SESSION: 'user:session:',
    USER_PROFILE: 'user:profile:',
    AUTH_TOKEN: 'auth:token:',
    RATE_LIMIT: 'rate:limit:',
    EMAIL_VERIFICATION: 'email:verification:',
    PASSWORD_RESET: 'password:reset:'
  },
  MAX_SIZE: {
    REDIS: '256mb',
    MEMORY: 100 * 1024 * 1024 // 100MB
  }
} as const;

// Validation Constants
export const VALIDATION = {
  EMAIL: {
    MAX_LENGTH: 254,
    MIN_LENGTH: 5
  },
  USERNAME: {
    MAX_LENGTH: 30,
    MIN_LENGTH: 3,
    PATTERN: /^[a-zA-Z0-9_-]+$/
  },
  NAME: {
    MAX_LENGTH: 50,
    MIN_LENGTH: 1,
    PATTERN: /^[a-zA-Z\s'-]+$/
  },
  PHONE: {
    MAX_LENGTH: 20,
    MIN_LENGTH: 10,
    PATTERN: /^\+?[1-9]\d{1,14}$/
  },
  URL: {
    MAX_LENGTH: 2048,
    PATTERN: /^https?:\/\/.+/
  }
} as const;

// API Constants
export const API = {
  VERSIONS: {
    V1: 'v1',
    V2: 'v2'
  },
  CONTENT_TYPES: {
    JSON: 'application/json',
    XML: 'application/xml',
    FORM: 'application/x-www-form-urlencoded',
    MULTIPART: 'multipart/form-data',
    TEXT: 'text/plain'
  },
  HEADERS: {
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE: 'Content-Type',
    ACCEPT: 'Accept',
    USER_AGENT: 'User-Agent',
    X_FORWARDED_FOR: 'X-Forwarded-For',
    X_REAL_IP: 'X-Real-IP',
    X_REQUEST_ID: 'X-Request-ID',
    X_API_KEY: 'X-API-Key'
  }
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number',
    PASSWORDS_DONT_MATCH: 'Passwords do not match',
    INVALID_PHONE: 'Please enter a valid phone number',
    INVALID_URL: 'Please enter a valid URL',
    TOO_SHORT: 'Value is too short',
    TOO_LONG: 'Value is too long',
    INVALID_FORMAT: 'Invalid format'
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_LOCKED: 'Account is locked due to too many failed attempts',
    ACCOUNT_DISABLED: 'Account is disabled',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    ALREADY_AUTHENTICATED: 'Already authenticated',
    NOT_AUTHENTICATED: 'Authentication required'
  },
  GENERAL: {
    INTERNAL_ERROR: 'An internal error occurred',
    NOT_FOUND: 'Resource not found',
    ALREADY_EXISTS: 'Resource already exists',
    OPERATION_FAILED: 'Operation failed',
    INVALID_REQUEST: 'Invalid request',
    RATE_LIMITED: 'Rate limit exceeded',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable'
  }
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTRATION_SUCCESS: 'Registration successful',
    PASSWORD_CHANGED: 'Password changed successfully',
    PASSWORD_RESET: 'Password reset successfully',
    EMAIL_VERIFIED: 'Email verified successfully',
    EMAIL_SENT: 'Email sent successfully'
  },
  GENERAL: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    OPERATION_SUCCESS: 'Operation completed successfully'
  }
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  OBJECT_ID: /^[0-9a-fA-F]{24}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
  SLUG: /^[a-z0-9-]+$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  TIME_24H: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^\d+$/,
  ALPHA: /^[a-zA-Z]+$/
} as const;

// Environment Configuration Keys
export const ENV_KEYS = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  HOST: 'HOST',
  
  // Database
  MONGODB_URI: 'MONGODB_URI',
  MYSQL_HOST: 'MYSQL_HOST',
  MYSQL_PORT: 'MYSQL_PORT',
  MYSQL_USER: 'MYSQL_USER',
  MYSQL_PASSWORD: 'MYSQL_PASSWORD',
  MYSQL_DATABASE: 'MYSQL_DATABASE',
  
  // Redis
  REDIS_URL: 'REDIS_URL',
  REDIS_HOST: 'REDIS_HOST',
  REDIS_PORT: 'REDIS_PORT',
  REDIS_PASSWORD: 'REDIS_PASSWORD',
  
  // JWT
  JWT_SECRET: 'JWT_SECRET',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  
  // Email
  EMAIL_HOST: 'EMAIL_HOST',
  EMAIL_PORT: 'EMAIL_PORT',
  EMAIL_USER: 'EMAIL_USER',
  EMAIL_PASSWORD: 'EMAIL_PASSWORD',
  EMAIL_FROM: 'EMAIL_FROM',
  
  // External Services
  AWS_ACCESS_KEY_ID: 'AWS_ACCESS_KEY_ID',
  AWS_SECRET_ACCESS_KEY: 'AWS_SECRET_ACCESS_KEY',
  AWS_REGION: 'AWS_REGION',
  S3_BUCKET: 'S3_BUCKET',
  
  // Application
  APP_NAME: 'APP_NAME',
  APP_URL: 'APP_URL',
  FRONTEND_URL: 'FRONTEND_URL',
  API_VERSION: 'API_VERSION',
  LOG_LEVEL: 'LOG_LEVEL'
} as const;

// Default Values
export const DEFAULTS = {
  PORT: 3000,
  HOST: 'localhost',
  API_VERSION: 'v1',
  LOG_LEVEL: 'info',
  TIMEZONE: 'UTC',
  LOCALE: 'en-US',
  CURRENCY: 'USD'
} as const;

// Type exports for better TypeScript support
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type Environment = typeof ENVIRONMENTS[keyof typeof ENVIRONMENTS];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
export type EmailType = typeof EMAIL.TYPES[keyof typeof EMAIL.TYPES];
export type ApiVersion = typeof API.VERSIONS[keyof typeof API.VERSIONS];
