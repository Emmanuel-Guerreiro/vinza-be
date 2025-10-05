import { Router } from 'express';
import { EstadoEventoController } from './controller';
import { estadoEventoService } from './service';
import { authMiddleware } from '@/auth/middleware';
import { requirePermissions } from '@/rbac/middleware';
import { Permissions } from '@/rbac/permissions';
import logger from '@/logger';

const controller = new EstadoEventoController(estadoEventoService);
const router = Router();

/**
 * @openapi
 * /estado-eventos:
 *   get:
 *     summary: Get all estado eventos
 *     tags:
 *       - EstadoEventos
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  '',
  authMiddleware,
  requirePermissions([Permissions.EVENTOS_READ]),
  controller.getAll,
);

/**
 * @openapi
 * /estado-eventos/{id}:
 *   get:
 *     summary: Get an estado evento by id
 *     tags:
 *       - EstadoEventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the estado evento
 *     responses:
 *       200:
 *         description: EstadoEvento found successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.EVENTOS_READ]),
  controller.getOne,
);

/**
 * @openapi
 * /estado-eventos:
 *   post:
 *     summary: Create an estado evento
 *     tags:
 *       - EstadoEventos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del estado evento
 *                 required: true
 *                 example: "Activo"
 *     responses:
 *       201:
 *         description: EstadoEvento created successfully
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
 * /estado-eventos/{id}:
 *   put:
 *     summary: Update an estado evento
 *     tags:
 *       - EstadoEventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the estado evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del estado evento
 *                 example: "Activo"
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
 *         description: EstadoEvento updated successfully
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
 * /estado-eventos/{id}:
 *   delete:
 *     summary: Delete an estado evento
 *     tags:
 *       - EstadoEventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the estado evento
 *     responses:
 *       200:
 *         description: EstadoEvento deleted successfully
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

logger.debug('EstadoEvento router initialized');

export default router;
