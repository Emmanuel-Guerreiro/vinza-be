import { Router } from 'express';
import { RecorridoController } from './controller';
import { recorridoService } from './service';
import logger from '@/logger';
import { authMiddleware } from '@/auth/middleware';
import { Permissions } from '@/rbac/permissions';
import { requirePermissions } from '@/rbac/middleware';
import { validateRecorrdidoOwnership } from './middleware';

const controller = new RecorridoController(recorridoService);
const router = Router();

/**
 * @openapi
 * /recorrido:
 *   get:
 *     summary: Get all recorridos
 *     tags:
 *       - Recorridos
 *     responses:
 *       200:
 *         description: Recorridos retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get(
  '',
  authMiddleware,
  requirePermissions([Permissions.RECORRIDO_READ]),
  controller.getAll,
);

/**
 * @openapi
 * /recorrido/{id}:
 *   get:
 *     summary: Get a recorrido by id
 *     tags:
 *       - Recorridos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the recorrido
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recorrido retrieved successfully
 *       404:
 *         description: Recorrido not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.RECORRIDO_READ]),
  controller.getOne,
);

/**
 * @openapi
 * /recorrido:
 *   post:
 *     summary: Create a new recorrido
 *     tags:
 *       - Recorridos
 *     responses:
 *       201:
 *         description: Recorrido created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
  '',
  authMiddleware,
  requirePermissions([Permissions.RECORRIDO_MANAGE]),
  controller.create,
);

/**
 * @openapi
 * /recorrido/{id}:
 *   put:
 *     summary: Update a recorrido by id
 *     tags:
 *       - Recorridos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the recorrido to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "123"
 *               name:
 *                 type: string
 *                 description: Nombre del recorrido
 *     responses:
 *       200:
 *         description: Recorrido updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Recorrido not found
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.RECORRIDO_MANAGE]),
  controller.update,
);

/**
 * @openapi
 * /recorrido/{id}:
 *   delete:
 *     summary: Delete a recorrido by id
 *     tags:
 *       - Recorridos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the recorrido to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recorrido deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.RECORRIDO_MANAGE]),
  controller.delete,
);

/**
 * @openapi
 * /recorrido/{id}/confirmar:
 *   post:
 *     summary: Confirm a recorrido by id
 *     tags:
 *       - Recorridos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the recorrido to confirm
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recorrido confirmed successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Recorrido not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:id/confirmar',
  authMiddleware,
  requirePermissions([Permissions.RECORRIDO_MANAGE]),
  validateRecorrdidoOwnership,
  controller.confirmar,
);

/**
 * @openapi
 * /recorrido/{id}/optimize:
 *   post:
 *     summary: Optimize a recorrido by id
 *     tags:
 *       - Recorridos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the recorrido to optimize
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recorrido optimized successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Recorrido not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:id/optimize',
  authMiddleware,
  requirePermissions([Permissions.RECORRIDO_MANAGE]),
  validateRecorrdidoOwnership,
  controller.optimize,
);

/**
 * @openapi
 * /recorrido/{id}/apply-optimization:
 *   post:
 *     summary: Apply optimization to a recorrido by id
 *     tags:
 *       - Recorridos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the recorrido to apply optimization
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recorrido optimization applied successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Recorrido not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:id/apply-optimization',
  authMiddleware,
  requirePermissions([Permissions.RECORRIDO_MANAGE]),
  validateRecorrdidoOwnership,
  controller.applyOptimization,
);

logger.debug('Recorridos router initialized');
export default router;
