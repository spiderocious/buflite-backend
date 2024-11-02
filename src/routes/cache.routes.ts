import { Router } from 'express';
import { CacheController } from '@/controllers/cache.controller';

const router = Router();

/**
 * Cache Management Routes
 * All routes are for cache monitoring and management
 */

// Cache statistics and health
router.get('/stats', CacheController.getStats);

// Cache keys management
router.get('/keys', CacheController.getKeys);
router.get('/keys/:key', CacheController.getKeyInfo);
router.delete('/keys/:key', CacheController.deleteKey);

// Cache operations
router.delete('/flush', CacheController.flushCache);
router.post('/reset-metrics', CacheController.resetMetrics);
router.post('/cleanup', CacheController.cleanupExpired);
router.post('/toggle', CacheController.toggleCache);

// Manual cache operations (for testing/debugging)
router.post('/set', CacheController.setValue);
router.get('/get/:key', CacheController.getValue);

export default router;
