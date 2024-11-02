import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLog.controller';

const router = Router();

/**
 * @route GET /audit
 * @desc Get audit logs with optional filters
 * @access Internal (requires internal token)
 * @query {string} action - Filter by action (optional)
 * @query {string} user - Filter by user (optional)
 * @query {string} startDate - Start date filter (ISO 8601 format, optional)
 * @query {string} endDate - End date filter (ISO 8601 format, optional)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 50, max: 100)
 */
router.get('/', AuditLogController.getLogs);

/**
 * @route GET /audit/stats
 * @desc Get audit log statistics
 * @access Internal (requires internal token)
 * @query {number} days - Number of days to include in stats (default: 30, max: 365)
 */
router.get('/stats', AuditLogController.getStats);

/**
 * @route GET /audit/config
 * @desc Get audit log service configuration
 * @access Internal (requires internal token)
 */
router.get('/config', AuditLogController.getConfig);

/**
 * @route PUT /audit/config
 * @desc Update audit log service configuration
 * @access Internal (requires internal token)
 * @body {boolean} enabled - Enable/disable audit logging (optional)
 * @body {string[]} exemptedActions - List of actions to exempt from logging (optional)
 */
router.put('/config', AuditLogController.updateConfig);

/**
 * @route GET /audit/actions
 * @desc Get list of unique actions from audit logs
 * @access Internal (requires internal token)
 * @query {number} days - Number of days to look back (default: 30, max: 365)
 */
router.get('/actions', AuditLogController.getActions);

/**
 * @route GET /audit/users
 * @desc Get list of unique users from audit logs
 * @access Internal (requires internal token)
 * @query {number} days - Number of days to look back (default: 30, max: 365)
 */
router.get('/users', AuditLogController.getUsers);

export default router;
