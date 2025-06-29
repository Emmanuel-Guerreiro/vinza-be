import { Router } from 'express';
import { MaximosDiasAdelanteReservaController } from './controller';
import logger from '@/logger';
import { authMiddleware } from '@/auth/middleware';
import { requirePermissions } from '@/rbac/middleware';
import { Permissions } from '@/rbac/permissions';

const router = Router();
const controller = new MaximosDiasAdelanteReservaController();

/**
 * @openapi
 * /maximos-dias-adelante-reserva:
 *   get:
 *     summary: Get the current MaximosDiasAdelanteReserva value
 *     tags:
 *       - MaximosDiasAdelanteReserva
 *     responses:
 *       200:
 *         description: The current value
 */
router.get(
  '/',
  authMiddleware,
  requirePermissions([Permissions.SUDO]),
  controller.findAll,
);

/**
 * @openapi
 * /maximos-dias-adelante-reserva:
 *   put:
 *     summary: Update the MaximosDiasAdelanteReserva value (deletes old and creates new)
 *     tags:
 *       - MaximosDiasAdelanteReserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valor:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Updated value
 *       400:
 *         description: Validation error
 */
router.put(
  '/',
  authMiddleware,
  requirePermissions([Permissions.SUDO]),
  controller.patch,
);

logger.debug('MaximosDiasAdelanteReserva router initialized');

export default router;
