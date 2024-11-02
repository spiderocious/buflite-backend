import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { errorHandler } from '../middleware/errorHandler';
import { SuccessResponse } from '../utils/response';

/**
 * Authentication Routes
 * Handles all authentication-related endpoints
 */

const router = Router();

/**
 * Public Routes (No authentication required)
 */

// User Registration
router.post('/register', AuthController.register);

// User Login
router.post('/login', AuthController.login);
/**
 * Health Check Route
 */
router.get('/health', (req, res) => {
  SuccessResponse(res, 'Authentication service is healthy');
});

// Apply error handler
router.use(errorHandler);

export default router;
