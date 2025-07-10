import { Router } from 'express';
import { EstadoInstanciaEventoController } from './controller';
import { estadoInstanciaEventoService } from './service';
import { authMiddleware } from '@/auth/middleware';
import { requirePermissions } from '@/rbac/middleware';
import { Permissions } from '@/rbac/permissions';
import logger from '@/logger';

const controller = new EstadoInstanciaEventoController(estadoInstanciaEventoService);
const router = Router();

/**
 * @openapi
 * /estado-instancia-eventos:
 *   get:
 *     summary: Get all estado instancia eventos
 *     tags:
 *       - EstadoInstanciaEventos
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  '',
  authMiddleware,
  requirePermissions([Permissions.INSTANCIA_EVENTOS_READ]),
  controller.getAll,
);

/**
 * @openapi
 * /estado-instancia-eventos/{id}:
 *   get:
 *     summary: Get an estado instancia evento by id
 *     tags:
 *       - EstadoInstanciaEventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the estado instancia evento
 *     responses:
 *       200:
 *         description: EstadoInstanciaEvento found successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.INSTANCIA_EVENTOS_READ]),
  controller.getOne,
);

/**
 * @openapi
 * /estado-instancia-eventos:
 *   post:
 *     summary: Create an estado instancia evento
 *     tags:
 *       - EstadoInstanciaEventos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del estado instancia evento
 *                 required: true
 *                 example: "Activa"
 *     responses:
 *       201:
 *         description: EstadoInstanciaEvento created successfully
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
 * /estado-instancia-eventos/{id}:
 *   put:
 *     summary: Update an estado instancia evento
 *     tags:
 *       - EstadoInstanciaEventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the estado instancia evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del estado instancia evento
 *                 example: "Activa"
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
 *         description: EstadoInstanciaEvento updated successfully
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
 * /estado-instancia-eventos/{id}:
 *   delete:
 *     summary: Delete an estado instancia evento
 *     tags:
 *       - EstadoInstanciaEventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the estado instancia evento
 *     responses:
 *       200:
 *         description: EstadoInstanciaEventos deleted successfully
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

logger.debug('EstadoInstanciaEvento router initialized');

export default router;
