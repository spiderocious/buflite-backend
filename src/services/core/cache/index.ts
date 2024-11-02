// Cache Service Exports
export { cacheService as CacheService, default as cacheServiceInstance } from './cache.service';
export type { CacheOptions, CacheStats, CacheKeyInfo, ICacheService } from './types';

// Convenience exports for easy usage
export const {
  getFromCache,
  saveToCache,
  deleteFromCache,
  flushCache,
  getCacheStats,
  getCacheKeys,
  getCacheInfo,
  isEnabled,
  enable,
  disable,
  resetMetrics,
  getHealth,
  cleanupExpired,
  setMultiple,
  getMultiple,
} = require('./cache.service').cacheService;
