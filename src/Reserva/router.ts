import { Router } from 'express';
import { ReservaController } from './controller';
import { reservaService } from './service';
import { authMiddleware } from '@/auth/middleware';
import logger from '@/logger';
import { Permissions } from '@/rbac/permissions';
import { requirePermissions } from '@/rbac/middleware';

const controller = new ReservaController(reservaService);
const router = Router();

/**
 * @openapi
 * /reservas:
 *   get:
 *     summary: Get all reservas
 *     tags:
 *       - Reservas
 *      parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: number
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         required: false
 *         schema:
 *           type: number
 *      responses:
 *        200:
 *        description: Reserva created successfully
 *        400:
 *        description: Bad request
 *        500:
 *        description: Internal server error
 *
 */
router.get(
  '',
  authMiddleware,
  requirePermissions([Permissions.RESERVAS_READ]),
  controller.getAll,
);
/**
 * @openapi
 * /reservas/{id}:
 *   get:
 *     summary: Get a reserva by ID
 *     tags:
 *       - Reservas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the reserva to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva retrieved successfully
 *       404:
 *         description: Reserva not found
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.RESERVAS_READ]),
  controller.getOne,
);

/**
 * @openapi
 * /reservas:
 *   post:
 * summary: Create a new reserva
 * tags:
 *   - Reservas
 * parameters:
 * - name: reserva
 *   in: body
 * description: Reserva object to create
 * required: true
 * schema:
 *   type: object
 * properties:
 * id:
 * required: true
 * response:
 * 200:
 * description: Reserva created successfully
 * 400:
 * description: Bad request
 * 500:
 * description: Internal server error
 */
router.post(
  '',
  authMiddleware,
  requirePermissions([Permissions.RESERVAS_MANAGE]),
  controller.create,
);

/**
 * @openapi
 * /reservas/{id}:
 *   put:
 *     summary: Update a reserva by ID
 *     tags:
 *       - Reservas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the reserva to update
 *        schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: The reserva ID
 *               required: true
 *             otherProperty:
 *               type: string
 *               description: Another property of the reserva
 *               required: false
 *     responses:
 *       200:
 *         description: Reserva updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Reserva not found
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.RESERVAS_MANAGE]),
  controller.update,
);

/**
 * @openapi
 * /reservas/{id}:
 *  delete:
 *     summary: Delete a reserva by ID
 *    tags:
 *    - Reservas
 *  parameters:
 *    - name: id
 *      in: path
 *    required: true
 *    description: ID of the reserva to delete
 *  responses:
 *  200:
 *     description: Reserva deleted successfully
 *  400:
 *    description: Bad request
 *  500:
 *   description: Internal server error
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.RESERVAS_MANAGE]),
  controller.delete,
);
logger.debug('Reservas router initialized');
export default router;
