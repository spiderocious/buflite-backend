import { Request } from 'express';

/**
 * Options for content analysis
 */
export interface AnalysisOptions {
  /** Whether to check cache first before making API call */
  cacheFirst?: boolean;
  /** User ID for context and logging */
  userId?: string;
  /** Content type for analysis (post, video, etc.) */
  contentType?: string;
  /** Cache configuration */
  cacheConfig?: {
    /** Cache TTL in seconds */
    ttl?: number;
    /** Whether caching is enabled */
    enabled?: boolean;
  };
}

/**
 * Result of content analysis
 */
export interface AnalysisResult {
  /** Unique analysis ID */
  analysisId: string;
  /** Analysis data returned from AI service */
  [key: string]: any;
}

/**
 * Cache key generation options
 */
export interface CacheKeyOptions {
  content: string;
  contentType: string;
  userId?: string;
}

/**
 * Request status enum for audit logging
 */
export enum RequestStatus {
  ANTHROPIC_SUCCESS = 'ANTHROPIC_SUCCESS',
  ANTHROPIC_ERROR = 'ANTHROPIC_ERROR',
  ANTHROPIC_REQUEST = 'ANTHROPIC_REQUEST',
  ANTHROPIC_RESULT = 'ANTHROPIC_RESULT',
}

/**
 * Anthropic service configuration
 */
export interface AnthropicConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  defaultCacheTTL: number;
}

/**
 * Analysis context for logging and tracking
 */
export interface AnalysisContext {
  request: Request;
  userId: string;
  contentType: string;
  analysisId: string;
  startTime: number;
}
