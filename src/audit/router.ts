import { Router } from 'express';
import { AuditController } from './controller';
import { auditService } from './service';
import { authMiddleware } from '@/auth/middleware';
import { requirePermissions } from '@/rbac/middleware';
import { Permissions } from '@/rbac/permissions';
import logger from '@/logger';

const router = Router();

const auditController = new AuditController(auditService);

/**
 * @swagger
 * /audits:
 *   get:
 *     tags:
 *       - Audits
 *     summary: Get all audits
 *     description: Returns a paginated list of audits with filtering options
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Order by field and direction (e.g., 'id:asc', 'createdAt:desc')
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter audits by user ID
 *       - in: query
 *         name: tipoEvento
 *         schema:
 *           type: string
 *         description: Filter audits by event type (e.g., 'user:create', 'evento:update')
 *     responses:
 *       '200':
 *         description: A paginated list of audits
 */
router.get(
  '',
  authMiddleware,
  requirePermissions([Permissions.SUDO]),
  auditController.findAll,
);

logger.debug('Audit router initialized');

export default router;
