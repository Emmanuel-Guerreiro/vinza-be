import { Router } from 'express';
import { EstadoReservaController } from './controller';
import { estadoReservaService } from './service';
import { authMiddleware } from '@/auth/middleware';
import { requirePermissions } from '@/rbac/middleware';
import { Permissions } from '@/rbac/permissions';
import logger from '@/logger';

const controller = new EstadoReservaController(estadoReservaService);
const router = Router();

/**
 * @openapi
 * /estado-reserva:
 *   get:
 *     summary: Get all estado reservas
 *     tags:
 *       - EstadoReservas
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  '',
  authMiddleware,
  requirePermissions([Permissions.RESERVAS_READ]),
  controller.getAll,
);

/**
 * @openapi
 * /estado-reserva/{id}:
 *   get:
 *     summary: Get an estado reserva by id
 *     tags:
 *       - EstadoReservas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the estado reserva
 *     responses:
 *       200:
 *         description: EstadoReserva found successfully
 *       400:
 *         description: Bad request
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
 * /estado-reserva:
 *   post:
 *     summary: Create an estado reserva
 *     tags:
 *       - EstadoReservas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del estado reserva
 *                 required: true
 *                 example: "Confirmada"
 *     responses:
 *       201:
 *         description: EstadoReserva created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
  '',
  authMiddleware,
  requirePermissions([Permissions.SUDO]),
  controller.create,
);

/**
 * @openapi
 * /estado-reserva/{id}:
 *   put:
 *     summary: Update an estado reserva
 *     tags:
 *       - EstadoReservas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the estado reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del estado reserva
 *                 example: "Confirmada"
 *               created_at:
 *                 type: string
 *                 description: Fecha de creación
 *                 example: "2024-01-01T00:00:00Z"
 *               updated_at:
 *                 type: string
 *                 description: Fecha de actualización
 *                 example: "2024-01-02T00:00:00Z"
 *               deleted_at:
 *                 type: string
 *                 description: Fecha de borrado
 *                 example: null
 *     responses:
 *       200:
 *         description: EstadoReserva updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.SUDO]),
  controller.update,
);

/**
 * @openapi
 * /estado-reserva/{id}:
 *   delete:
 *     summary: Delete an estado reserva
 *     tags:
 *       - EstadoReservas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the estado reserva
 *     responses:
 *       200:
 *         description: EstadoReserva deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.SUDO]),
  controller.delete,
);

/**
 * @openapi
 * /estado-reserva/{id}/can-delete:
 *   get:
 *     summary: Check if an estado reserva can be deleted
 *     tags:
 *       - EstadoReservas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the estado reserva
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Estado reserva not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id/can-delete',
  authMiddleware,
  requirePermissions([Permissions.SUDO]),
  controller.canDelete,
);

logger.debug('EstadoReserva router initialized');

export default router;
