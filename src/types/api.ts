/**
 * Common API Request and Response Types
 */

import { Request } from 'express';
import { UserRole } from '../utils/constants';

/**
 * Pagination Types
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Standard API Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors: string[];
  code?: string;
  timestamp: string;
  requestId?: string;
  stack?: string; // Only in development
}

export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

/**
 * Authentication Types
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

/**
 * Extended Request Types
 */
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  requestId?: string;
}

export interface PaginatedRequest extends Request {
  query: PaginationQuery & Record<string, any>;
}

export interface AuthenticatedPaginatedRequest extends AuthenticatedRequest {
  query: PaginationQuery & Record<string, any>;
}

/**
 * File Upload Types
 */
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
}

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

/**
 * Search and Filter Types
 */
export interface SearchQuery {
  q?: string;
  filters?: Record<string, any>;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterOptions {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'regex';
  value: any;
}

/**
 * Validation Types
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Database Types
 */
export interface DatabaseDocument {
  _id?: string;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeleteDocument extends DatabaseDocument {
  deletedAt?: Date;
  isDeleted: boolean;
}

/**
 * Cache Types
 */
export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  compression?: boolean;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl: number;
  createdAt: Date;
  accessedAt: Date;
  hitCount: number;
}

/**
 * Email Types
 */
export interface EmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  templateId?: string;
  templateData?: Record<string, any>;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  cid?: string;
}

export interface EmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
  pending?: string[];
  response: string;
}

/**
 * Job/Queue Types
 */
export interface JobData {
  id: string;
  type: string;
  payload: Record<string, any>;
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
}

export interface JobResult {
  id: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'delayed';
  progress?: number;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
}

/**
 * Health Check Types
 */
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  uptime: number;
  version: string;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  time: number;
  output?: string;
  details?: Record<string, any>;
}

/**
 * Webhook Types
 */
export interface WebhookPayload {
  id: string;
  event: string;
  data: Record<string, any>;
  timestamp: Date;
  signature?: string;
}

export interface WebhookDelivery {
  id: string;
  url: string;
  payload: WebhookPayload;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  lastAttempt?: Date;
  nextAttempt?: Date;
  response?: {
    status: number;
    headers: Record<string, string>;
    body: string;
  };
}

/**
 * Analytics Types
 */
export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId?: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
  referrer?: string;
}

export interface AnalyticsQuery {
  event?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  filters?: Record<string, any>;
  groupBy?: string[];
  aggregations?: string[];
}

/**
 * Utility Types
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ID = string;
export type Timestamp = Date | string;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

/**
 * Environment Configuration Types
 */
export interface DatabaseConfig {
  mongodb?: {
    uri: string;
    options?: Record<string, any>;
  };
  mysql?: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    options?: Record<string, any>;
  };
  redis?: {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
    options?: Record<string, any>;
  };
}

export interface EmailConfig {
  host: string;
  port: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  templates?: {
    path: string;
    engine: string;
  };
}

export interface AppConfig {
  name: string;
  version: string;
  environment: string;
  port: number;
  host: string;
  url: string;
  frontendUrl: string;
  logLevel: string;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export interface SecurityConfig {
  jwt: {
    secret: string;
    refreshSecret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
    issuer: string;
    audience: string;
  };
  bcrypt: {
    saltRounds: number;
  };
  session: {
    secret: string;
    maxAge: number;
  };
}

export interface ExternalServiceConfig {
  aws?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3Bucket?: string;
  };
  stripe?: {
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  sendgrid?: {
    apiKey: string;
    fromEmail: string;
  };
}
