import { Request, Response, NextFunction } from 'express';
import { CacheService } from '@/services/core/cache';
import { logger } from '@/utils/logger';
import { GenericResponse } from '../utils/response';

export interface CacheMiddlewareOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string; // Custom key generator
  condition?: (req: Request) => boolean; // Condition to cache
  headers?: boolean; // Include cache headers in response
}

/**
 * Cache middleware factory
 * Creates middleware for automatic response caching
 */
export const cacheMiddleware = (options: CacheMiddlewareOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check condition if provided
    if (options.condition && !options.condition(req)) {
      return next();
    }

    // Generate cache key
    const cacheKey = options.keyGenerator 
      ? options.keyGenerator(req)
      : generateDefaultCacheKey(req);

    // Try to get from cache
    const cachedResponse = CacheService.getFromCache<{
      statusCode: number;
      data: any;
      headers?: Record<string, string>;
    }>(cacheKey);

    if (cachedResponse) {
      // Set cache headers if enabled
      if (options.headers) {
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
      }

      // Set any cached headers
      if (cachedResponse.headers) {
        Object.entries(cachedResponse.headers).forEach(([key, value]) => {
          res.set(key, value);
        });
      }

      logger.debug(`Cache hit for: ${cacheKey}`);
      GenericResponse(res, cachedResponse.statusCode, true, 'Cache hit', cachedResponse.data);
      return;
    }

    // Cache miss - intercept response
    const originalSend = res.send;
    const originalJson = res.json;
    let responseData: any;
    let responseSent = false;

    // Override res.json
    res.json = function(data: any) {
      if (!responseSent) {
        responseData = data;
        responseSent = true;
        
        // Cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const cacheData = {
            statusCode: res.statusCode,
            data: data,
            headers: extractCacheableHeaders(res),
          };

          CacheService.saveToCache(cacheKey, cacheData, {
            expiresIn: options.ttl,
          });

          logger.debug(`Cached response for: ${cacheKey}`);
        }

        // Set cache headers if enabled
        if (options.headers) {
          res.set('X-Cache', 'MISS');
          res.set('X-Cache-Key', cacheKey);
        }
      }

      return originalJson.call(this, data);
    };

    // Override res.send
    res.send = function(data: any) {
      if (!responseSent) {
        responseData = data;
        responseSent = true;

        // Try to parse JSON for caching
        try {
          const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const cacheData = {
              statusCode: res.statusCode,
              data: parsedData,
              headers: extractCacheableHeaders(res),
            };

            CacheService.saveToCache(cacheKey, cacheData, {
              expiresIn: options.ttl,
            });

            logger.debug(`Cached response for: ${cacheKey}`);
          }
        } catch (error) {
          // If not JSON, still cache as-is for non-JSON responses
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const cacheData = {
              statusCode: res.statusCode,
              data: data,
              headers: extractCacheableHeaders(res),
            };

            CacheService.saveToCache(cacheKey, cacheData, {
              expiresIn: options.ttl,
            });
          }
        }

        // Set cache headers if enabled
        if (options.headers) {
          res.set('X-Cache', 'MISS');
          res.set('X-Cache-Key', cacheKey);
        }
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Generate default cache key from request
 */
const generateDefaultCacheKey = (req: Request): string => {
  const url = req.originalUrl || req.url;
  const method = req.method;
  const queryString = JSON.stringify(req.query);
  
  // Include user ID if available for user-specific caching
  const userId = (req as any).user?.id || '';
  
  return `cache:${method}:${url}:${queryString}:${userId}`;
};

/**
 * Extract cacheable headers from response
 */
const extractCacheableHeaders = (res: Response): Record<string, string> => {
  const cacheableHeaders: Record<string, string> = {};
  
  // Headers that are safe to cache
  const allowedHeaders = [
    'content-type',
    'content-length',
    'etag',
    'last-modified',
    'cache-control',
  ];

  allowedHeaders.forEach(header => {
    const value = res.get(header);
    if (value) {
      cacheableHeaders[header] = value;
    }
  });

  return cacheableHeaders;
};

/**
 * Cache invalidation middleware
 * Clears cache entries that match a pattern
 */
export const cacheInvalidationMiddleware = (patterns: string[] | ((req: Request) => string[])) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Store original end function
    const originalEnd = res.end;

    // Override end to invalidate cache after successful response
    res.end = function(chunk?: any, encoding?: any) {
      // Only invalidate on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const patternsToInvalidate = typeof patterns === 'function' 
          ? patterns(req) 
          : patterns;

        patternsToInvalidate.forEach(pattern => {
          invalidateCachePattern(pattern);
        });
      }

      // Call original end
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

/**
 * Invalidate cache entries matching a pattern
 */
const invalidateCachePattern = (pattern: string): void => {
  try {
    const keys = CacheService.getCacheKeys();
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    let invalidated = 0;
    keys.forEach(key => {
      if (regex.test(key)) {
        CacheService.deleteFromCache(key);
        invalidated++;
      }
    });

    if (invalidated > 0) {
      logger.info(`Invalidated ${invalidated} cache entries matching pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error('Error invalidating cache pattern:', error);
  }
};

/**
 * Conditional caching middleware
 * Only caches responses based on custom conditions
 */
export const conditionalCacheMiddleware = (
  condition: (req: Request, res: Response) => boolean,
  options: CacheMiddlewareOptions = {}
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Store original send/json to check response before caching
    const originalJson = res.json;
    
    res.json = function(data: any) {
      // Check condition after response is ready
      if (condition(req, res)) {
        // Apply caching
        const cacheKey = options.keyGenerator 
          ? options.keyGenerator(req)
          : generateDefaultCacheKey(req);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          const cacheData = {
            statusCode: res.statusCode,
            data: data,
            headers: extractCacheableHeaders(res),
          };

          CacheService.saveToCache(cacheKey, cacheData, {
            expiresIn: options.ttl,
          });
        }
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Cache warming middleware
 * Pre-loads cache with data based on request patterns
 */
export const cacheWarmingMiddleware = (
  warmupFunction: (req: Request) => Promise<Array<{ key: string; data: any; ttl?: number }>>
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Perform cache warming asynchronously
      setImmediate(async () => {
        try {
          const warmupData = await warmupFunction(req);
          
          warmupData.forEach(({ key, data, ttl }) => {
            CacheService.saveToCache(key, data, { expiresIn: ttl });
          });

          logger.debug(`Warmed up ${warmupData.length} cache entries`);
        } catch (error) {
          logger.error('Error during cache warming:', error);
        }
      });
    } catch (error) {
      logger.error('Error setting up cache warming:', error);
    }

    next();
  };
};

/**
 * Cache bypass middleware
 * Allows bypassing cache for specific requests
 */
export const cacheBypassMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check for cache bypass headers or query parameters
    const bypassHeader = req.get('X-Cache-Bypass');
    const bypassQuery = req.query['cache-bypass'];
    const noCacheHeader = req.get('Cache-Control');

    if (bypassHeader === 'true' || 
        bypassQuery === 'true' || 
        noCacheHeader?.includes('no-cache')) {
      
      // Mark request to bypass cache
      (req as any).bypassCache = true;
      
      // Set response headers
      res.set('X-Cache', 'BYPASSED');
      
      logger.debug('Cache bypassed for request');
    }

    next();
  };
};

/**
 * Smart cache middleware with automatic key generation and TTL
 */
export const smartCacheMiddleware = (baseOptions: CacheMiddlewareOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip if bypass is requested
    if ((req as any).bypassCache) {
      return next();
    }

    // Smart TTL based on route patterns
    let smartTTL = baseOptions.ttl;
    
    if (!smartTTL) {
      if (req.path.includes('/users/')) {
        smartTTL = 300; // 5 minutes for user data
      } else if (req.path.includes('/stats/')) {
        smartTTL = 60; // 1 minute for stats
      } else if (req.path.includes('/health')) {
        smartTTL = 30; // 30 seconds for health checks
      } else {
        smartTTL = 600; // 10 minutes default
      }
    }

    // Apply caching with smart options
    return cacheMiddleware({
      ...baseOptions,
      ttl: smartTTL,
      headers: true, // Always include cache headers
      condition: (req) => {
        // Don't cache error responses or authenticated requests with sensitive data
        return req.method === 'GET' && 
               !req.path.includes('/auth/') &&
               !req.path.includes('/admin/');
      }
    })(req, res, next);
  };
};

// Export all middleware functions
export {
  invalidateCachePattern,
  generateDefaultCacheKey,
  extractCacheableHeaders,
};
