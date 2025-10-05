import { Router } from 'express';
import { CategoriaEventoController } from './controller';
import { categoriaEventoService } from './service';
import { authMiddleware } from '@/auth/middleware';
import { requirePermissions } from '@/rbac/middleware';
import { Permissions } from '@/rbac/permissions';
import logger from '@/logger';

const controller = new CategoriaEventoController(categoriaEventoService);
const router = Router();

/**
 * @openapi
 * /categoria-eventos:
 *   get:
 *     summary: Get all categoria eventos
 *     tags:
 *       - CategoriaEventos
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
 * /categoria-eventos/{id}:
 *   get:
 *     summary: Get a categoria evento by id
 *     tags:
 *       - CategoriaEventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the categoria evento
 *     responses:
 *       200:
 *         description: CategoriaEvento found successfully
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
 * /categoria-eventos:
 *   post:
 *     summary: Create a categoria evento
 *     tags:
 *       - CategoriaEventos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la categoria evento
 *                 required: true
 *                 example: "Conferencia"
 *     responses:
 *       201:
 *         description: CategoriaEvento created successfully
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
 * /categoria-eventos/{id}:
 *   put:
 *     summary: Update a categoria evento
 *     tags:
 *       - CategoriaEventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the categoria evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la categoria evento
 *                 example: "Conferencia"
 *     responses:
 *       200:
 *         description: CategoriaEvento updated successfully
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
 * /categoria-eventos/{id}:
 *   delete:
 *     summary: Delete a categoria evento
 *     tags:
 *       - CategoriaEventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the categoria evento
 *     responses:
 *       200:
 *         description: CategoriaEvento deleted successfully
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

logger.debug('CategoriaEvento router initialized');

export default router;
