import { Router } from 'express';
import { EventoController } from './controller';
import { eventoService } from './service';
import logger from '@/logger';

const controller = new EventoController(eventoService);
const router = Router();

/**
 * @openapi
 * /eventos:
 *   get:
 *     summary: Get all eventos
 *     tags:
 *       - Eventos
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: number
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         required: false
 *         schema:
 *           type: number
 *       - name: sucursalId
 *         in: query
 *         description: Filter by specific sucursal ID
 *         required: false
 *         schema:
 *           type: number
 *       - name: categoriaId
 *         in: query
 *         description: Filter by specific category ID
 *         required: false
 *         schema:
 *           type: number
 *       - name: estadoId
 *         in: query
 *         description: Filter by specific state ID
 *         required: false
 *         schema:
 *           type: number
 *       - name: bodegaId
 *         in: query
 *         description: Filter by specific bodega ID (through sucursal relationship)
 *         required: false
 *         schema:
 *           type: string
 *       - name: fechaDesde
 *         in: query
 *         description: Filter events created from this date (ISO format)
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: fechaHasta
 *         in: query
 *         description: Filter events created until this date (ISO format)
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: precioMaximo
 *         in: query
 *         description: Filter events with price less than or equal to this value
 *         required: false
 *         schema:
 *           type: number
 *       - name: puntuacionMinima
 *         in: query
 *         description: Filter events with minimum rating (0-5 scale)
 *         required: false
 *         schema:
 *           type: number
 *       - name: nombre
 *         in: query
 *         description: Filter events by name (case-insensitive search)
 *         required: false
 *         schema:
 *           type: string
 *       - name: orderBy
 *         in: query
 *         description: "Order results by field and direction (format: field:direction)"
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of eventos retrieved successfully
 *       400:
 *         description: Bad request - Invalid filter parameters
 *       500:
 *         description: Internal server error
 */
router.get('', controller.getAll);

/**
 * @openapi
 * /eventos/{id}:
 *   get:
 *     summary: Get an evento by id
 *     tags:
 *       - Eventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the evento
 *     responses:
 *       200:
 *         description: Evento found successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/:id', controller.getOne);

/**
 * @openapi
 * /eventos:
 *   post:
 *     summary: Create an evento
 *     tags:
 *       - Eventos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del evento
 *                 required: true
 *                 example: "Charla de tecnología"
 *               descripcion:
 *                 type: string
 *                 description: Descripción del evento
 *                 required: true
 *                 example: "Evento sobre nuevas tecnologías."
 *               cupo:
 *                 type: string
 *                 description: Cupo del evento
 *                 required: true
 *                 example: "50"
 *               sucursalId:
 *                 type: number
 *                 description: ID de la sucursal a la que pertenece
 *                 required: true
 *                 example: 1
 *               estadoId:
 *                 type: number
 *                 description: ID del estado del evento
 *                 required: true
 *                 example: 1
 *               categoriaId:
 *                 type: number
 *                 description: ID de la categoría del evento
 *                 required: true
 *                 example: 1
 *               precio:
 *                 type: number
 *                 description: Precio del evento
 *                 required: true
 *                 example: 25.50
 *               recurrencias:
 *                 type: array
 *                 description: Array de recurrencias del evento
 *                 required: false
 *                 items:
 *                   type: object
 *                   properties:
 *                     dia:
 *                       type: string
 *                       description: Día de la semana (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo)
 *                       enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
 *                       example: "Lunes"
 *                     hora:
 *                       type: string
 *                       description: Hora del evento (formato HH:MM, desde 08:00 hasta 23:30)
 *                       enum: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"]
 *                       example: "18:00"
 *                     fecha_desde:
 *                       type: string
 *                       format: date
 *                       description: Fecha desde la cual comienza la recurrencia
 *                       example: "2024-01-01"
 *                     fecha_hasta:
 *                       type: string
 *                       format: date
 *                       description: Fecha hasta la cual termina la recurrencia
 *                       example: "2024-12-31"
 *     responses:
 *       201:
 *         description: Evento created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('', controller.create);

/**
 * @openapi
 * /eventos/{id}:
 *   put:
 *     summary: Update an evento
 *     tags:
 *       - Eventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del evento
 *                 example: "Charla de tecnología"
 *               descripcion:
 *                 type: string
 *                 description: Descripción del evento
 *                 example: "Evento sobre nuevas tecnologías."
 *               cupo:
 *                 type: string
 *                 description: Cupo del evento
 *                 example: "50"
 *               sucursalId:
 *                 type: number
 *                 description: ID de la sucursal a la que pertenece
 *                 example: 1
 *               estadoId:
 *                 type: number
 *                 description: ID del estado del evento
 *                 example: 1
 *               categoriaId:
 *                 type: number
 *                 description: ID de la categoría del evento
 *                 example: 1
 *               precio:
 *                 type: number
 *                 description: Precio del evento
 *                 example: 25.50
 *               recurrencias:
 *                 type: array
 *                 description: Array de recurrencias del evento
 *                 items:
 *                   type: object
 *                   properties:
 *                     dia:
 *                       type: string
 *                       description: Día de la semana (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo)
 *                       enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
 *                       example: "Martes"
 *                     hora:
 *                       type: string
 *                       description: Hora del evento (formato HH:MM, desde 08:00 hasta 23:30)
 *                       enum: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"]
 *                       example: "19:00"
 *                     fecha_desde:
 *                       type: string
 *                       format: date
 *                       description: Fecha desde la cual comienza la recurrencia
 *                       example: "2024-02-01"
 *                     fecha_hasta:
 *                       type: string
 *                       format: date
 *                       description: Fecha hasta la cual termina la recurrencia
 *                       example: "2024-11-30"
 *     responses:
 *       200:
 *         description: Evento updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /eventos/{id}:
 *   delete:
 *     summary: Delete an evento
 *     tags:
 *       - Eventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the evento
 *     responses:
 *       200:
 *         description: Evento deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', controller.delete);

logger.debug('Evento router initialized');

export default router;
