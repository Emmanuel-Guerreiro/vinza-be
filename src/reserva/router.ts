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
 * /reserva:
 *   get:
 *     summary: Get all reservas
 *     tags:
 *       - Reservas
 *     responses:
 *       200:
 *         description: Reservas retrieved successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get(
  '',
  authMiddleware,
  requirePermissions([Permissions.RESERVAS_READ]),
  controller.getAll,
);

/**
 * @openapi
 * /reserva/{id}:
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
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.RESERVAS_READ]),
  controller.getOne,
);

/**
 * @openapi
 * /reserva:
 *   post:
 *     summary: Create a new reserva
 *     tags:
 *       - Reservas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidadGente:
 *                 type: number
 *                 description: Number of people for the reservation
 *                 example: 4
 *               instanciaEventoId:
 *                 type: number
 *                 description: ID of the event instance
 *                 example: 15
 *               recorridoId:
 *                 type: number
 *                 description: ID of the route (optional)
 *                 example: 8
 *     responses:
 *       201:
 *         description: Reserva created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

router.post(
  '',
  authMiddleware,
  requirePermissions([Permissions.GESTOR_RESERVAS]),
  controller.create,
);

/**
 * @openapi
 * /reserva/{id}:
 *   put:
 *     summary: Update a reserva by ID
 *     tags:
 *       - Reservas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the reserva to update
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
 *                 description: The reserva ID
 *                 example: "123"
 *               otherProperty:
 *                 type: string
 *                 description: Another property of the reserva
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
  requirePermissions([Permissions.GESTOR_RESERVAS]),
  controller.update,
);

/**
 * @openapi
 * /reserva/{id}:
 *   delete:
 *     summary: Delete a reserva by ID
 *     tags:
 *       - Reservas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the reserva to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.GESTOR_RESERVAS]),
  controller.delete,
);
logger.debug('Reservas router initialized');
export default router;
