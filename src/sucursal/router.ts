import { Router } from 'express';
import { SucursalController } from './controller';
import { sucursalService } from './service';
import { authMiddleware } from '@/auth/middleware';
import { requirePermissions } from '@/rbac/middleware';
import { Permissions } from '@/rbac/permissions';
import logger from '@/logger';

const controller = new SucursalController(sucursalService);
const router = Router();

/**
 * @openapi
 * /sucursales:
 *   get:
 *     summary: Get all sucursales
 *     tags:
 *       - Sucursales
 *     responses:
 *       200:
 *         description: Success
 */
router.get('', controller.getAll);

/**
 * @openapi
 * /sucursales/mi-bodega:
 *   get:
 *     summary: Get sucursales de mi bodega
 *     description: Get sucursales filtradas por la bodega del usuario autenticado
 *     tags:
 *       - Sucursales
 *     responses:
 *       200:
 *         description: List of sucursales from user's bodega retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   nombre:
 *                     type: string
 *                   direccion:
 *                     type: string
 *                   aclaraciones:
 *                     type: string
 *                   es_principal:
 *                     type: boolean
 *                   bodegaId:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/mi-bodega', authMiddleware, controller.getAllByBodega);

/**
 * @openapi
 * /sucursales/{id}:
 *   get:
 *     summary: Get a sucursal by id
 *     tags:
 *       - Sucursales
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the sucursal
 *     responses:
 *       200:
 *         description: Sucursal found successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/:id', controller.getOne);

/**
 * @openapi
 * /sucursales:
 *   post:
 *     summary: Create a sucursal
 *     tags:
 *       - Sucursales
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: El nombre de la sucursal
 *                 required: true
 *                 example: "Sucursal Central"
 *               es_principal:
 *                 type: boolean
 *                 description: Si es la sucursal principal
 *                 example: true
 *               direccion:
 *                 type: string
 *                 description: Dirección de la sucursal
 *                 required: true
 *                 example: "Calle 123, Ciudad"
 *               aclaraciones:
 *                 type: string
 *                 description: Aclaraciones adicionales sobre la sucursal
 *                 example: "Sucursal ubicada en el centro comercial"
 *               bodegaId:
 *                 type: number
 *                 description: ID de la bodega a la que pertenece
 *                 required: true
 *                 example: 1
 *     responses:
 *       201:
 *         description: Sucursal created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('', controller.create);

/**
 * @openapi
 * /sucursales/{id}:
 *   put:
 *     summary: Update a sucursal
 *     tags:
 *       - Sucursales
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the sucursal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: El nombre de la sucursal
 *                 example: "Sucursal Central"
 *               es_principal:
 *                 type: boolean
 *                 description: Si es la sucursal principal
 *                 example: true
 *               direccion:
 *                 type: string
 *                 description: Dirección de la sucursal
 *                 example: "Calle 123, Ciudad"
 *               aclaraciones:
 *                 type: string
 *                 description: Aclaraciones adicionales sobre la sucursal
 *                 example: "Sucursal ubicada en el centro comercial"
 *     responses:
 *       200:
 *         description: Sucursal updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /sucursales/{id}:
 *   delete:
 *     summary: Delete a sucursal
 *     tags:
 *       - Sucursales
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the sucursal
 *     responses:
 *       200:
 *         description: Sucursal deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', controller.delete);

/**
 * @openapi
 * /sucursales/{id}/can-delete:
 *   security:
 *     - bearerAuth: []
 *   get:
 *     summary: Check if a sucursal can be deleted
 *     tags:
 *       - Sucursales
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the sucursal
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 canDelete:
 *                   type: boolean
 *                   description: Whether the sucursal can be deleted
 *       404:
 *         description: Sucursal not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id/can-delete',
  authMiddleware,
  requirePermissions([Permissions.BODEGAS_MANAGE]),
  controller.canDelete,
);

logger.debug('Sucursal router initialized');

export default router;
