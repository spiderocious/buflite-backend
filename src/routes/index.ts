import { Router } from 'express';
import { analyzeContent } from '../controllers/analyzer.controller';
import { fetchDashboardTrends, getDashboardData } from '../controllers/dashboard.controller';
import { authenticateToken, rateLimitByUser } from '../middleware/auth';
import { NotFoundResponse, SuccessResponse } from '../utils/response';
import authRoutes from './auth.routes';

/**
 * Main Routes Index
 * Combines all route modules and sets up API versioning
 */

const router = Router();

/**
 * API Health Check (legacy endpoint)
 */
router.get('/health', (req, res) => {
  SuccessResponse(res, 'API is healthy', {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * API Version 1 Routes
 */
const v1Router = Router();

// Authentication routes (public and protected)
v1Router.use('/auth', authRoutes);

v1Router.post('/app/analyze', authenticateToken, rateLimitByUser(2, 3600000), analyzeContent);
v1Router.get('/app/dashboard', authenticateToken, getDashboardData);
v1Router.post('/app/dashboard/trends', authenticateToken, fetchDashboardTrends);


// Mount v1 routes
router.use('/v1', v1Router);

// Default route redirect to v1
router.use('/api', v1Router);

/**
 * Catch-all route for undefined endpoints
 */
router.use('*', (req, res) => {
  NotFoundResponse(res, 'Endpoint not found', {
    path: req.originalUrl,
    method: req.method,
  });
});

export default router;
