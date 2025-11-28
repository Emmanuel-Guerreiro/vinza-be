import { Router } from 'express';
import { NotificacionController } from './controller';
import { notificacionService } from './service';
import { authMiddleware } from '@/auth/middleware';
import { Permissions } from '@/rbac/permissions';
import { requirePermissions } from '@/rbac/middleware';

const controller = new NotificacionController(notificacionService);
const router = Router();

/**
 * @openapi
 * /notificacion/send:
 *   post:
 *     summary: Enviar notificación push a un usuario específico
 *     tags:
 *       - Notificaciones
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - titulo
 *               - descripcion
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID del usuario al que se enviará la notificación
 *               titulo:
 *                 type: string
 *                 description: Título de la notificación
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la notificación
 *               data:
 *                 type: object
 *                 description: Datos adicionales para la notificación (opcional)
 *     responses:
 *       200:
 *         description: Notificación enviada exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Usuario no encontrado o sin token de push configurado
 *       500:
 *         description: Error al enviar la notificación
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - No tienes permisos para realizar esta acción
 */
router.post(
  '/send',
  authMiddleware,
  requirePermissions([Permissions.SUDO]),
  controller.sendNotification,
);

export default router;
