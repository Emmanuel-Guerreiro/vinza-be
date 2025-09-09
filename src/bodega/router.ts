import { Router } from 'express';
import { BodegaController } from './controller';
import { bodegaService } from './service';
import logger from '@/logger';
import { authMiddleware } from '@/auth/middleware';
import { requirePermissions } from '@/rbac/middleware';
import { Permissions } from '@/rbac/permissions';

const controller = new BodegaController(bodegaService);
const router = Router();

/**
 * @openapi
 * /bodegas:
 *   get:
 *     summary: Get all bodegas
 *     tags:
 *       - Bodegas
 *     responses:
 *       200:
 *         description: Success
 */
router.get('', controller.getAll);

/**
 * @openapi
 * /bodegas/{id}:
 *   get:
 *     summary: Get a bodega by id
 *     tags:
 *       - Bodegas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the bodega
 *     responses:
 *       200:
 *         description: Bodega found successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/:id', controller.getOne);

/**
 * @openapi
 * /bodegas:
 *   post:
 *     summary: Create a bodega
 *     tags:
 *       - Bodegas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - direccion
 *               - telefono
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: El nombre de la bodega
 *                 example: "Bodega Central"
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la bodega
 *                 example: "Bodega principal de almacenamiento"
 *               direccion:
 *                 type: string
 *                 description: Dirección de la bodega
 *                 example: "Av. Principal 123"
 *               telefono:
 *                 type: string
 *                 description: Teléfono de contacto de la bodega
 *                 example: "+54 11 1234-5678"
 *               aclaraciones:
 *                 type: string
 *                 description: Aclaraciones adicionales (opcional)
 *                 example: "Horario de atención: 8:00 a 18:00"
 *     responses:
 *       201:
 *         description: Bodega created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('', controller.create);

/**
 * @openapi
 * /bodegas/{id}:
 *   put:
 *     summary: Update a bodega
 *     tags:
 *       - Bodegas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the bodega
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: El nombre de la bodega
 *                 example: "Bodega Central"
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la bodega
 *                 example: "Bodega principal de almacenamiento"
 *               roles:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Los ids de los roles relacionados
 *                 example: [1]
 *               users:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Los ids de los usuarios relacionados
 *                 example: [1,2]
 *     responses:
 *       200:
 *         description: Bodega updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /bodegas/{id}:
 *   delete:
 *     summary: Delete a bodega
 *     tags:
 *       - Bodegas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the bodega
 *     responses:
 *       200:
 *         description: Bodega deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', controller.delete);

/**
 * @openapi
 * /bodegas/{id}/validate:
 *   post:
 *     summary: Validate a bodega
 *     tags:
 *       - Bodegas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the bodega
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               es_valida:
 *                 type: boolean
 *                 description: Whether the bodega is valid
 *                 required: true
 *                 example: true
 *     responses:
 *       200:
 *         description: Bodega validated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:id/validate',
  authMiddleware,
  requirePermissions([Permissions.BODEGAS_VALIDATE]),
  controller.validate,
);

logger.debug('Bodega router initialized');

export default router;
