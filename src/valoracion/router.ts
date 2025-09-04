import { Router } from 'express';
import { ValoracionController } from './controller';
import { valoracionService } from './service';
import { authMiddleware } from '@/auth/middleware';
import { requirePermissions } from '@/rbac/middleware';
import { Permissions } from '@/rbac/permissions';
import logger from '@/logger';

const controller = new ValoracionController(valoracionService);
const router = Router();

/**
 * @openapi
 * /valoraciones:
 *   get:
 *     summary: Get all valoraciones
 *     tags:
 *       - Valoraciones
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  '',
  authMiddleware,
  requirePermissions([Permissions.VALORACIONES_READ]),
  controller.getAll,
);

/**
 * @openapi
 * /valoraciones/{id}:
 *   get:
 *     summary: Get a valoracion by id
 *     tags:
 *       - Valoraciones
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the valoracion
 *     responses:
 *       200:
 *         description: Valoracion found successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.VALORACIONES_READ]),
  controller.getOne,
);

/**
 * @openapi
 * /valoraciones:
 *   post:
 *     summary: Create a valoracion
 *     tags:
 *       - Valoraciones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valor:
 *                 type: number
 *                 description: Valor de la valoración (1-5)
 *                 required: true
 *                 example: 4
 *               comentario:
 *                 type: string
 *                 description: Comentario de la valoración
 *                 required: true
 *                 example: "Muy buen evento"
 *               userId:
 *                 type: number
 *                 description: ID del usuario que escribe la valoración
 *                 required: true
 *                 example: 1
 *               eventoId:
 *                 type: number
 *                 description: ID del evento valorado
 *                 required: true
 *                 example: 2
 *     responses:
 *       201:
 *         description: Valoracion created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
  '',
  authMiddleware,
  requirePermissions([Permissions.VALORACIONES_MANAGE]),
  controller.create,
);

/**
 * @openapi
 * /valoraciones/{id}:
 *   delete:
 *     summary: Delete a valoracion
 *     tags:
 *       - Valoraciones
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the valoracion
 *     responses:
 *       200:
 *         description: Valoracion deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.VALORACIONES_MANAGE]),
  controller.delete,
);

/**
 * @openapi
 * /valoraciones/evento/{eventoId}/average:
 *   get:
 *     summary: Get the average valor of valoraciones for an evento
 *     tags:
 *       - Valoraciones
 *     parameters:
 *       - name: eventoId
 *         in: path
 *         required: true
 *         description: The id of the evento
 *     responses:
 *       200:
 *         description: Average valor fetched successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get(
  '/evento/:eventoId/average',
  authMiddleware,
  requirePermissions([Permissions.VALORACIONES_READ]),
  controller.getAverageByEvento,
);

logger.debug('Valoracion router initialized');

export default router;
