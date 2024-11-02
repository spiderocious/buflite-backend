import { Router } from 'express';
import authRoutes from './auth.routes';
import auditLogRoutes from './auditLog.routes';
import { authenticateToken, rateLimitByUser } from '../middleware/auth';
import { validateInternalToken } from '../middleware/internalAuth';
import { SuccessResponse, NotFoundResponse } from '../utils/response';
import { analyzeContent } from '../controllers/analyzer.controller';

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

v1Router.use('/app/analyze', authenticateToken, rateLimitByUser(50, 3600000), analyzeContent);


// Mount v1 routes
router.use('/v1', v1Router);

// Default route redirect to v1
router.use('/api', v1Router);

/**
 * API Documentation route
 */
router.get('/docs', validateInternalToken, (req, res) => {
  SuccessResponse(res, 'API Documentation', {
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}`,
    publicEndpoints: {
      health: '/health',
      apiHealth: '/api/health',
      auth: '/api/v1/auth',
      docs: '/api/docs'
    },
    protectedEndpoints: {
      email: '/api/v1/email (internal token required)',
      cache: '/api/v1/cache (internal token required)',
      docs: '/api/docs (internal token required)',
      profile: '/api/v1/me (authenticated)'
    },
    internalEndpoints: {
      note: 'These endpoints require INTERNAL_API_TOKEN in Authorization header or x-internal-token header',
      email: '/api/v1/email/* (internal token required)',
      cache: '/api/v1/cache/* (internal token required)',
      docs: '/api/docs (internal token required)'
    },
    endpoints: {
      auth: {
        register: 'POST /v1/auth/register',
        login: 'POST /v1/auth/login',
        refreshToken: 'POST /v1/auth/refresh-token',
        logout: 'POST /v1/auth/logout',
        profile: 'GET /v1/auth/profile',
        updateProfile: 'PUT /v1/auth/profile',
        changePassword: 'PUT /v1/auth/change-password',
        forgotPassword: 'POST /v1/auth/forgot-password',
        resetPassword: 'POST /v1/auth/reset-password',
        verifyEmail: 'POST /v1/auth/verify-email',
        resendVerification: 'POST /v1/auth/resend-verification'
      },
      email: {
        send: 'POST /v1/email/send (Internal token required)',
        templates: 'GET /v1/email/templates (Internal token required)'
      },
      cache: {
        get: 'GET /v1/cache/:key (Internal token required)',
        set: 'POST /v1/cache/:key (Internal token required)',
        delete: 'DELETE /v1/cache/:key (Internal token required)',
        clear: 'POST /v1/cache/clear (Internal token required)'
      },
      user: {
        me: 'GET /v1/me (Protected)'
      },
      admin: {
        note: 'Internal token endpoints for administrative access'
      }
    },
    authentication: {
      userAuth: {
        type: 'Bearer Token (JWT)',
        header: 'Authorization: Bearer <your-jwt-token>',
        tokenExpiry: '24 hours',
        refreshTokenExpiry: '7 days'
      },
      internalAuth: {
        type: 'Internal API Token',
        header: 'Authorization: Bearer <INTERNAL_API_TOKEN> OR x-internal-token: <INTERNAL_API_TOKEN>',
        description: 'Used for admin endpoints like email, cache, and docs'
      }
    }
  });
});

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
