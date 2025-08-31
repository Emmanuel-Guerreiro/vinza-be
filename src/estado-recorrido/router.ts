import { Router } from 'express';
import { authMiddleware } from '@/auth/middleware';
import { estadoRecorridoService } from './service';
import { EstadoRecorridoController } from './controller';
import logger from '@/logger';

const controller = new EstadoRecorridoController(estadoRecorridoService);
const router = Router();

/**
 * @openapi
 * /estado-recorrido:
 *   get:
 *     summary: Get all estado recorridos
 *     tags:
 *       - EstadoRecorridos
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', authMiddleware, controller.getAll);

/**
 * @openapi
 * /estado-recorrido/{id}:
 *   get:
 *     summary: Get an estado recorrido by id
 *     tags:
 *       - EstadoRecorridos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the estado recorrido
 *     responses:
 *       200:
 *         description: EstadoRecorrido found successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authMiddleware, controller.getOne);

/**
 * @openapi
 * /estado-recorrido:
 *   post:
 *     summary: Create a new estado recorrido
 *     tags:
 *       - EstadoRecorridos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *             required:
 *               - nombre
 *     responses:
 *       201:
 *         description: EstadoRecorrido created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, controller.create);

/**
 * @openapi
 * /estado-recorrido/{id}:
 *   put:
 *     summary: Update an existing estado recorrido
 *     tags:
 *       - EstadoRecorridos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the estado recorrido to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *                 example: "En Proceso"
 *               created_at:
 *                 type: string
 *                 description: Fecha de creación del estado recorrido
 *                 example: "2023-10-01T12:00:00Z"
 *               updated_at:
 *                 type: string
 *                 description: Fecha de última actualización del estado recorrido
 *                 example: "2023-10-05T15:30:00Z"
 *               deleted_at:
 *                 type: string
 *                 description: Fecha de eliminación del estado recorrido
 *                 example: null
 *     responses:
 *       200:
 *         description: EstadoRecorrido updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, controller.update);

/**
 * @openapi
 * /estado-recorrido/{id}:
 *   delete:
 *     summary: Delete an estado recorrido by id
 *     tags:
 *       - EstadoRecorridos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the estado recorrido to delete
 *     responses:
 *       200:
 *         description: EstadoRecorrido deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, controller.delete);

logger.debug('EstadoRecorrido router initialized');

export default router;
