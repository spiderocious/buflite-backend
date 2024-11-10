import NodeCache from 'node-cache';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { CacheOptions, CacheStats, CacheKeyInfo, ICacheService } from './types';

class CacheService implements ICacheService {
  private static instance: CacheService;
  private cache: NodeCache;
  private metrics: {
    hits: number;
    misses: number;
    totalRequests: number;
  };
  private enabled: boolean;

  private constructor() {
    this.enabled = true;
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
    };

    // Initialize NodeCache with configuration
    this.cache = new NodeCache({
      stdTTL: config.cache.defaultTTL, // Default TTL in seconds
      checkperiod: config.cache.checkPeriod, // Check period for expired keys
      useClones: false, // Don't clone objects (better performance)
      deleteOnExpire: true, // Delete expired keys automatically
      enableLegacyCallbacks: false, // Use modern promise-based callbacks
      maxKeys: 10000, // Maximum number of keys (prevent memory issues)
    });

    // Set up event listeners for metrics
    this.setupEventListeners();

    logger.info('Cache service initialized successfully');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Setup event listeners for cache events
   */
  private setupEventListeners(): void {
    // Listen for expired keys
    this.cache.on('expired', (key: string, value: any) => {
      logger.debug(`Cache key expired: ${key}`);
    });

    // Listen for deleted keys
    this.cache.on('del', (key: string, value: any) => {
      logger.debug(`Cache key deleted: ${key}`);
    });

    // Listen for cache flushes
    this.cache.on('flush', () => {
      logger.info('Cache flushed');
      this.resetMetrics();
    });
  }

  /**
   * Get value from cache
   */
  public getFromCache<T>(key: string): T | null {
    if (!this.enabled) {
      return null;
    }

    try {
      this.metrics.totalRequests++;
      
      const value = this.cache.get<T>(key);
      
      if (value !== undefined) {
        this.metrics.hits++;
        logger.debug(`Cache hit for key: ${key}`);
        return value;
      } else {
        this.metrics.misses++;
        logger.debug(`Cache miss for key: ${key}`);
        return null;
      }
    } catch (error) {
      logger.error('Error getting from cache:', error);
      this.metrics.misses++;
      return null;
    }
  }

  /**
   * Save value to cache
   */
  public saveToCache(key: string, data: any, options?: CacheOptions): boolean {
    if (!this.enabled) {
      return false;
    }
    try {
      const ttl = options?.expiresIn || config.cache.defaultTTL;
      
      const success = this.cache.set(key, data, ttl);
      
      if (success) {
        logger.debug(`Cache set for key: ${key}, TTL: ${ttl}s`);
      } else {
        logger.warn(`Failed to set cache for key: ${key}`);
      }
      
      return success;
    } catch (error) {
      logger.error('Error saving to cache:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  public deleteFromCache(key: string): boolean {
    if (!this.enabled) {
      return false;
    }

    try {
      const deleted = this.cache.del(key);
      
      if (deleted > 0) {
        logger.debug(`Cache deleted for key: ${key}`);
        return true;
      } else {
        logger.debug(`Cache key not found for deletion: ${key}`);
        return false;
      }
    } catch (error) {
      logger.error('Error deleting from cache:', error);
      return false;
    }
  }

  /**
   * Flush all cache
   */
  public flushCache(): void {
    try {
      this.cache.flushAll();
      logger.info('Cache flushed successfully');
    } catch (error) {
      logger.error('Error flushing cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): CacheStats {
    const keys = this.cache.keys();
    const hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.hits / this.metrics.totalRequests) * 100 
      : 0;

    // Calculate approximate memory usage
    const memoryUsage = this.calculateMemoryUsage();

    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      keys: keys.length,
      hitRate: Math.round(hitRate * 100) / 100, // Round to 2 decimal places
      totalRequests: this.metrics.totalRequests,
      memoryUsage,
    };
  }

  /**
   * Get all cache keys
   */
  public getCacheKeys(): string[] {
    try {
      return this.cache.keys();
    } catch (error) {
      logger.error('Error getting cache keys:', error);
      return [];
    }
  }

  /**
   * Get cache information for a specific key
   */
  public getCacheInfo(key: string): CacheKeyInfo | null {
    try {
      const value = this.cache.get(key);
      if (value === undefined) {
        return null;
      }

      const ttl = this.cache.getTtl(key);
      const stats = this.cache.getStats();

      return {
        key,
        value,
        ttl: ttl || 0,
        created: Date.now() - (config.cache.defaultTTL * 1000), // Approximate
        accessed: Date.now(),
      };
    } catch (error) {
      logger.error('Error getting cache info:', error);
      return null;
    }
  }

  /**
   * Check if cache is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable cache
   */
  public enable(): void {
    this.enabled = true;
    logger.info('Cache enabled');
  }

  /**
   * Disable cache
   */
  public disable(): void {
    this.enabled = false;
    logger.info('Cache disabled');
  }

  /**
   * Reset metrics
   */
  public resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
    };
    logger.info('Cache metrics reset');
  }

  /**
   * Get cache health status
   */
  public getHealth(): {
    status: 'healthy' | 'warning' | 'error';
    enabled: boolean;
    stats: CacheStats;
    issues: string[];
  } {
    const stats = this.getCacheStats();
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'error' = 'healthy';

    // Check for potential issues
    if (!this.enabled) {
      issues.push('Cache is disabled');
      status = 'warning';
    }

    if (stats.keys > 8000) {
      issues.push('High number of cached keys (approaching limit)');
      status = 'warning';
    }

    if (stats.hitRate < 50 && stats.totalRequests > 100) {
      issues.push('Low cache hit rate');
      status = 'warning';
    }

    if (stats.memoryUsage > 100 * 1024 * 1024) { // 100MB
      issues.push('High memory usage');
      status = 'warning';
    }

    return {
      status,
      enabled: this.enabled,
      stats,
      issues,
    };
  }

  /**
   * Calculate approximate memory usage
   */
  private calculateMemoryUsage(): number {
    try {
      const keys = this.cache.keys();
      let totalSize = 0;

      keys.forEach(key => {
        const value = this.cache.get(key);
        if (value !== undefined) {
          // Rough estimation of memory usage
          totalSize += JSON.stringify(value).length + key.length;
        }
      });

      return totalSize;
    } catch (error) {
      logger.error('Error calculating memory usage:', error);
      return 0;
    }
  }

  /**
   * Cleanup expired keys manually
   */
  public cleanupExpired(): number {
    try {
      const beforeCount = this.cache.keys().length;
      // Force check for expired keys
      this.cache.keys().forEach(key => {
        this.cache.get(key); // This will trigger cleanup of expired keys
      });
      const afterCount = this.cache.keys().length;
      const cleaned = beforeCount - afterCount;
      
      if (cleaned > 0) {
        logger.info(`Cleaned up ${cleaned} expired cache keys`);
      }
      
      return cleaned;
    } catch (error) {
      logger.error('Error during cache cleanup:', error);
      return 0;
    }
  }

  /**
   * Set multiple cache entries at once
   */
  public setMultiple(entries: Array<{ key: string; value: any; options?: CacheOptions }>): boolean {
    try {
      let allSuccess = true;
      
      entries.forEach(entry => {
        const success = this.saveToCache(entry.key, entry.value, entry.options);
        if (!success) {
          allSuccess = false;
        }
      });
      
      return allSuccess;
    } catch (error) {
      logger.error('Error setting multiple cache entries:', error);
      return false;
    }
  }

  /**
   * Get multiple cache entries at once
   */
  public getMultiple<T>(keys: string[]): Array<{ key: string; value: T | null }> {
    try {
      return keys.map(key => ({
        key,
        value: this.getFromCache<T>(key),
      }));
    } catch (error) {
      logger.error('Error getting multiple cache entries:', error);
      return keys.map(key => ({ key, value: null }));
    }
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();
export default cacheService;
