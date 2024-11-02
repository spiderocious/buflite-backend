export interface CacheOptions {
  expiresIn?: number; // Time to live in seconds
  checkPeriod?: number; // Period in seconds for the automatic delete check interval
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  hitRate: number;
  totalRequests: number;
  memoryUsage: number;
}

export interface CacheKeyInfo {
  key: string;
  value: any;
  ttl: number;
  created: number;
  accessed: number;
}

export interface ICacheService {
  getFromCache<T>(key: string): T | null;
  saveToCache(key: string, data: any, options?: CacheOptions): boolean;
  deleteFromCache(key: string): boolean;
  flushCache(): void;
  getCacheStats(): CacheStats;
  getCacheKeys(): string[];
  getCacheInfo(key: string): CacheKeyInfo | null;
  isEnabled(): boolean;
}
