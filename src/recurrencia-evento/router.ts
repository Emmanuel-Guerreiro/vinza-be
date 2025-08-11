import { Router } from 'express';
import { RecurrenciaEventoController } from './controller';
import { recurrenciaEventoService } from './service';

const controller = new RecurrenciaEventoController(recurrenciaEventoService);
const router = Router();

/**
 * @openapi
 * /recurrencia-evento:
 *   get:
 *     tags:
 *       - Recurrencia Evento
 *     summary: Obtener todas las recurrencias de eventos
 *     description: Retorna todas las recurrencias de eventos, opcionalmente filtradas por eventoId
 *     parameters:
 *       - in: query
 *         name: eventoId
 *         schema:
 *           type: integer
 *         description: ID del evento para filtrar recurrencias
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de recurrencias obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RecurrenciaEvento'
 *       500:
 *         description: Error interno del servidor
 */
router.get('', controller.getAll);

/**
 * @openapi
 * /recurrencia-evento:
 *   post:
 *     tags:
 *       - Recurrencia Evento
 *     summary: Crear una nueva recurrencia de evento
 *     description: Crea una nueva recurrencia de evento con los datos proporcionados
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dia
 *               - hora
 *               - fecha_desde
 *               - fecha_hasta
 *               - eventoId
 *             properties:
 *               dia:
 *                 type: string
 *                 description: Día de la semana para la recurrencia (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo)
 *                 enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
 *                 example: "Lunes"
 *               hora:
 *                 type: string
 *                 description: Hora de la recurrencia (formato HH:MM, desde 08:00 hasta 23:30)
 *                 enum: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"]
 *                 example: "18:00"
 *               fecha_desde:
 *                 type: string
 *                 format: date
 *                 description: Fecha desde la cual comienza la recurrencia
 *                 example: "2024-01-01"
 *               fecha_hasta:
 *                 type: string
 *                 format: date
 *                 description: Fecha hasta la cual termina la recurrencia
 *                 example: "2024-12-31"
 *               eventoId:
 *                 type: integer
 *                 description: ID del evento al que pertenece la recurrencia
 *                 example: 1
 *     responses:
 *       201:
 *         description: Recurrencia creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecurrenciaEvento'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('', controller.create);

/**
 * @openapi
 * /recurrencia-evento/create-many:
 *   post:
 *     tags:
 *       - Recurrencia Evento
 *     summary: Crear múltiples recurrencias de evento
 *     description: Crea múltiples recurrencias de evento con los datos proporcionados
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recurrencias
 *             properties:
 *               recurrencias:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - dia
 *                     - hora
 *                     - fecha_desde
 *                     - fecha_hasta
 *                     - eventoId
 *                   properties:
 *                     dia:
 *                       type: string
 *                       description: Día de la semana para la recurrencia
 *                       enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
 *                       example: "Lunes"
 *                     hora:
 *                       type: string
 *                       description: Hora de la recurrencia (formato HH:MM)
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
 *                     eventoId:
 *                       type: integer
 *                       description: ID del evento al que pertenece la recurrencia
 *                       example: 1
 *     responses:
 *       201:
 *         description: Recurrencias creadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RecurrenciaEvento'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/create-many', controller.createMany);

/**
 * @openapi
 * /recurrencia-evento/{id}:
 *   get:
 *     tags:
 *       - Recurrencia Evento
 *     summary: Obtener una recurrencia de evento por ID
 *     description: Retorna una recurrencia de evento específica por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la recurrencia de evento
 *         example: 1
 *     responses:
 *       200:
 *         description: Recurrencia encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecurrenciaEvento'
 *       404:
 *         description: Recurrencia no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', controller.getOne);

/**
 * @openapi
 * /recurrencia-evento/{id}:
 *   put:
 *     tags:
 *       - Recurrencia Evento
 *     summary: Actualizar una recurrencia de evento
 *     description: Actualiza una recurrencia de evento existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la recurrencia de evento
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dia:
 *                 type: string
 *                 description: Día de la semana para la recurrencia (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo)
 *                 enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
 *                 example: "Martes"
 *               hora:
 *                 type: string
 *                 description: Hora de la recurrencia (formato HH:MM, desde 08:00 hasta 23:30)
 *                 enum: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"]
 *                 example: "19:00"
 *               fecha_desde:
 *                 type: string
 *                 format: date
 *                 description: Fecha desde la cual comienza la recurrencia
 *                 example: "2024-02-01"
 *               fecha_hasta:
 *                 type: string
 *                 format: date
 *                 description: Fecha hasta la cual termina la recurrencia
 *                 example: "2024-11-30"
 *               eventoId:
 *                 type: integer
 *                 description: ID del evento al que pertenece la recurrencia
 *                 example: 2
 *     responses:
 *       200:
 *         description: Recurrencia actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecurrenciaEvento'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Recurrencia no encontrada
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /recurrencia-evento/{id}:
 *   delete:
 *     tags:
 *       - Recurrencia Evento
 *     summary: Eliminar una recurrencia de evento
 *     description: Elimina una recurrencia de evento por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la recurrencia de evento
 *         example: 1
 *     responses:
 *       204:
 *         description: Recurrencia eliminada exitosamente
 *       404:
 *         description: Recurrencia no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', controller.delete);

export default router;

