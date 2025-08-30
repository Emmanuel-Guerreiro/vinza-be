import { Router } from 'express';
import { RecurrenciaEventoController } from './controller';
import { recurrenciaEventoService } from './service';
import { requirePermissions } from '@/rbac/middleware';
import { Permissions } from '@/rbac/permissions';
import { authMiddleware } from '@/auth/middleware';

const controller = new RecurrenciaEventoController(recurrenciaEventoService);
const router = Router();

/**
 * @openapi
 * /recurrencia-evento:
 *   security:
 *     - bearerAuth: []
 *   get:
 *     summary: Obtener todas las recurrencias de eventos [EVENTOS_MANAGE]
 *     description: Retorna todas las recurrencias de eventos, opcionalmente filtradas por eventoId. Requires EVENTOS_MANAGE permission.
 *     tags:
 *       - Recurrencia Evento
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions. EVENTOS_MANAGE required.
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    '',
    authMiddleware,
    requirePermissions([Permissions.EVENTOS_MANAGE]),
    controller.getAll
);

/**
 * @openapi
 * /recurrencia-evento:
 *   security:
 *     - bearerAuth: []
 *   post:
 *     summary: Crear una nueva recurrencia de evento [EVENTOS_MANAGE]
 *     description: Crea una nueva recurrencia de evento con los datos proporcionados. Requires EVENTOS_MANAGE permission.
 *     tags:
 *       - Recurrencia Evento
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
 *                 description: Día de la semana para la recurrencia Lunes Martes Miércoles Jueves Viernes Sábado Domingo
 *                 enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
 *                 example: "Lunes"
 *               hora:
 *                 type: string
 *                 description: Hora de la recurrencia formato HH:MM desde 08:00 hasta 23:30
 *                 enum: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"]
 *                 example: "18:00"
 *               fecha_desde:
 *                 type: string
 *                 format: date
 *                 description: Fecha desde la cual comienza la recurrencia
 *                 example: "2026-01-01"
 *               fecha_hasta:
 *                 type: string
 *                 format: date
 *                 description: Fecha hasta la cual termina la recurrencia
 *                 example: "2026-12-31"
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions (EVENTOS_MANAGE required)
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
router.post(
    '',
    authMiddleware,
    requirePermissions([Permissions.EVENTOS_MANAGE]),
    controller.create
);

/**
 * @openapi
 * /recurrencia-evento/create-many:
 *   security:
 *     - bearerAuth: []
 *   post:
 *     summary: Crear múltiples recurrencias de evento [EVENTOS_MANAGE]
 *     description: Crea múltiples recurrencias de evento con los datos proporcionados. Requires EVENTOS_MANAGE permission.
 *     tags:
 *       - Recurrencia Evento
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
 *                       description: Hora de la recurrencia formato HH:MM
 *                       enum: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"]
 *                       example: "18:00"
 *                     fecha_desde:
 *                       type: string
 *                       format: date
 *                       description: Fecha desde la cual comienza la recurrencia
 *                       example: "2026-01-01"
 *                     fecha_hasta:
 *                       type: string
 *                       format: date
 *                       description: Fecha hasta la cual termina la recurrencia
 *                       example: "2026-12-31"
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions (EVENTOS_MANAGE required)
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
router.post(
    '/create-many',
    authMiddleware,
    requirePermissions([Permissions.EVENTOS_MANAGE]),
    controller.createMany
);

/**
 * @openapi
 * /recurrencia-evento/{id}:
 *   security:
 *     - bearerAuth: []
 *   get:
 *     summary: Obtener una recurrencia de evento por ID [EVENTOS_MANAGE]
 *     description: Retorna una recurrencia de evento específica por su ID. Requires EVENTOS_MANAGE permission.
 *     tags:
 *       - Recurrencia Evento
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions (EVENTOS_MANAGE required)
 *       404:
 *         description: Recurrencia no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    '/:id',
    authMiddleware,
    requirePermissions([Permissions.EVENTOS_MANAGE]),
    controller.getOne
);

/**
 * @openapi
 * /recurrencia-evento/{id}:
 *   security:
 *     - bearerAuth: []
 *   put:
 *     summary: Actualizar una recurrencia de evento [EVENTOS_MANAGE]
 *     description: Actualiza una recurrencia de evento existente. Requires EVENTOS_MANAGE permission.
 *     tags:
 *       - Recurrencia Evento
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
 *                 description: Día de la semana para la recurrencia Lunes Martes Miércoles Jueves Viernes Sábado Domingo
 *                 enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
 *                 example: "Martes"
 *               hora:
 *                 type: string
 *                 description: Hora de la recurrencia formato HH:MM desde 08:00 hasta 23:30
 *                 enum: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"]
 *                 example: "19:00"
 *               fecha_desde:
 *                 type: string
 *                 format: date
 *                 description: Fecha desde la cual comienza la recurrencia
 *                 example: "2027-02-01"
 *               fecha_hasta:
 *                 type: string
 *                 format: date
 *                 description: Fecha hasta la cual termina la recurrencia
 *                 example: "2027-11-30"
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions (EVENTOS_MANAGE required)
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Recurrencia no encontrada
 */
router.put(
    '/:id',
    authMiddleware,
    requirePermissions([Permissions.EVENTOS_MANAGE]),
    controller.update
);

/**
 * @openapi
 * /recurrencia-evento/{id}:
 *   security:
 *     - bearerAuth: []
 *   delete:
 *     summary: Eliminar una recurrencia de evento [EVENTOS_MANAGE]
 *     description: Elimina una recurrencia de evento por su ID. Requires EVENTOS_MANAGE permission.
 *     tags:
 *       - Recurrencia Evento
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions (EVENTOS_MANAGE required)
 *       404:
 *         description: Recurrencia no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete(
    '/:id',
    authMiddleware,
    requirePermissions([Permissions.EVENTOS_MANAGE]),
    controller.delete
);

export default router;
