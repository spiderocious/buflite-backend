import { Request, Response } from 'express';
import { CacheService } from '@/services/core/cache';
import { logger } from '@/utils/logger';
import {
  SuccessResponse,
  ErrorResponse,
  NotFoundResponse,
  InternalServerErrorResponse,
  ValidationErrorResponse,
} from '@/utils/response';

/**
 * Cache Controller
 * Provides API endpoints for cache management and monitoring
 */
export class CacheController {
  /**
   * Get cache statistics
   * GET /api/cache/stats
   */
  static getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = CacheService.getCacheStats();
      const health = CacheService.getHealth();
      
      SuccessResponse(res, 'Cache statistics retrieved successfully', {
        statistics: stats,
        health: health,
        enabled: CacheService.isEnabled(),
      });
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      InternalServerErrorResponse(res, 'Failed to get cache statistics');
    }
  };

  /**
   * Get all cache keys
   * GET /api/cache/keys
   */
  static getKeys = async (req: Request, res: Response): Promise<void> => {
    try {
      const keys = CacheService.getCacheKeys();
      
      SuccessResponse(res, 'Cache keys retrieved successfully', {
        keys,
        count: keys.length,
      });
    } catch (error) {
      logger.error('Error getting cache keys:', error);
      InternalServerErrorResponse(res, 'Failed to get cache keys');
    }
  };

  /**
   * Get cache info for specific key
   * GET /api/cache/keys/:key
   */
  static getKeyInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;
      
      if (!key) {
        ErrorResponse(res, 'Key parameter is required');
        return;
      }

      const info = CacheService.getCacheInfo(key);
      
      if (!info) {
        NotFoundResponse(res, 'Cache key not found');
        return;
      }

      SuccessResponse(res, 'Cache key info retrieved successfully', info);
    } catch (error) {
      logger.error('Error getting cache key info:', error);
      InternalServerErrorResponse(res, 'Failed to get cache key info');
    }
  };

  /**
   * Delete specific cache key
   * DELETE /api/cache/keys/:key
   */
  static deleteKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;
      
      if (!key) {
        ErrorResponse(res, 'Key parameter is required');
        return;
      }

      const deleted = CacheService.deleteFromCache(key);
      
      SuccessResponse(res, 'Cache key deleted successfully', {
        deleted,
        key,
      });
    } catch (error) {
      logger.error('Error deleting cache key:', error);
      InternalServerErrorResponse(res, 'Failed to delete cache key');
    }
  };

  /**
   * Flush all cache
   * DELETE /api/cache/flush
   */
  static flushCache = async (req: Request, res: Response): Promise<void> => {
    try {
      const statsBefore = CacheService.getCacheStats();
      CacheService.flushCache();
      
      SuccessResponse(res, 'Cache flushed successfully', {
        keysCleared: statsBefore.keys,
      });
    } catch (error) {
      logger.error('Error flushing cache:', error);
      InternalServerErrorResponse(res, 'Failed to flush cache');
    }
  };

  /**
   * Reset cache metrics
   * POST /api/cache/reset-metrics
   */
  static resetMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      CacheService.resetMetrics();
      
      SuccessResponse(res, 'Cache metrics reset successfully');
    } catch (error) {
      logger.error('Error resetting cache metrics:', error);
      InternalServerErrorResponse(res, 'Failed to reset cache metrics');
    }
  };

  /**
   * Cleanup expired keys
   * POST /api/cache/cleanup
   */
  static cleanupExpired = async (req: Request, res: Response): Promise<void> => {
    try {
      const cleaned = CacheService.cleanupExpired();
      
      SuccessResponse(res, 'Cache cleanup completed', {
        keysRemoved: cleaned,
      });
    } catch (error) {
      logger.error('Error cleaning up cache:', error);
      InternalServerErrorResponse(res, 'Failed to cleanup cache');
    }
  };

  /**
   * Enable/disable cache
   * POST /api/cache/toggle
   */
  static toggleCache = async (req: Request, res: Response): Promise<void> => {
    try {
      const { enabled } = req.body;
      
      if (typeof enabled !== 'boolean') {
        ValidationErrorResponse(res, 'enabled field must be a boolean');
        return;
      }

      if (enabled) {
        CacheService.enable();
      } else {
        CacheService.disable();
      }
      
      SuccessResponse(res, `Cache ${enabled ? 'enabled' : 'disabled'} successfully`, {
        data: {
          enabled: CacheService.isEnabled(),
        },
      });
    } catch (error) {
      logger.error('Error toggling cache:', error);
      InternalServerErrorResponse(res, 'Failed to toggle cache');
    }
  };

  /**
   * Set cache value (for testing/manual operations)
   * POST /api/cache/set
   */
  static setValue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key, value, expiresIn } = req.body;
      
      if (!key || value === undefined) {
        ErrorResponse(res, 'key and value are required');
        return;
      }

      const options = expiresIn ? { expiresIn } : undefined;
      const success = CacheService.saveToCache(key, value, options);
      
      SuccessResponse(res, success ? 'Value cached successfully' : 'Failed to cache value', {
        key,
        cached: success,
        expiresIn: expiresIn || 'default',
      });
    } catch (error) {
      logger.error('Error setting cache value:', error);
      InternalServerErrorResponse(res, 'Failed to set cache value');
    }
  };

  /**
   * Get cache value (for testing/manual operations)
   * GET /api/cache/get/:key
   */
  static getValue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;
      
      if (!key) {
        ErrorResponse(res, 'Key parameter is required');
        return;
      }

      const value = CacheService.getFromCache(key);
      
      SuccessResponse(res, 'Cache value retrieved successfully', {
        key,
        value,
        found: value !== null,
      });
    } catch (error) {
      logger.error('Error getting cache value:', error);
      InternalServerErrorResponse(res, 'Failed to get cache value');
    }
  };
}
