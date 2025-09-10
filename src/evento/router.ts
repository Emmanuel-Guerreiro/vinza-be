import { Router } from 'express';
import { EventoController } from './controller';
import { eventoService } from './service';
import { requirePermissions } from '@/rbac/middleware';
import { Permissions } from '@/rbac/permissions';
import { authMiddleware } from '@/auth/middleware';
import {
  eventoAuthMiddleware,
  sucursalAuthMiddleware,
  instanciaEventoAuthMiddleware,
} from './middleware';
import logger from '@/logger';

const controller = new EventoController(eventoService);
const router = Router();

/**
 * @openapi
 * /eventos:
 *   get:
 *     summary: Get all eventos
 *     description: Get all eventos with optional filtering
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
 *         description: Filter by specific bodega ID through sucursal relationship
 *         required: false
 *         schema:
 *           type: number
 *       - name: fechaDesde
 *         in: query
 *         description: Filter events created from this date in ISO format
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: fechaHasta
 *         in: query
 *         description: Filter events created until this date in ISO format
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
 *         description: Filter events with minimum rating on 0-5 scale
 *         required: false
 *         schema:
 *           type: number
 *       - name: nombre
 *         in: query
 *         description: Filter events by name using case-insensitive search
 *         required: false
 *         schema:
 *           type: string
 *       - name: orderBy
 *         in: query
 *         description: Order results by field and direction. Format field:direction
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of eventos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       nombre:
 *                         type: string
 *                       descripcion:
 *                         type: string
 *                       cupo:
 *                         type: number
 *                       precio:
 *                         type: number
 *                       sucursalId:
 *                         type: number
 *                       estadoId:
 *                         type: number
 *                       categoriaId:
 *                         type: number
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: number
 *                     currentPage:
 *                       type: number
 *                     itemsPerPage:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *       400:
 *         description: Bad request - Invalid filter parameters
 *       500:
 *         description: Internal server error
 */
router.get('', authMiddleware, controller.getAll);

/**
 * @openapi
 * /eventos/instancia/{instanciaId}:
 *   get:
 *     summary: Get an evento by instanciaId
 *     tags:
 *       - Eventos
 *     parameters:
 *       - name: instanciaId
 *         in: path
 *         required: true
 *         description: The id of the instancia
 *     responses:
 *       200:
 *         description: Evento found successfully
 *       400:
 *         description: Bad request - Invalid filter parameters
 *       500:
 *         description: Internal server error
 */
router.get(
  '/instancia/:instanciaId',
  authMiddleware,
  requirePermissions([Permissions.EVENTOS_READ]),
  controller.getInstanciaEvento,
);

/**
 * @openapi
 * /eventos/{id}:
 *   security:
 *     - bearerAuth: []
 *   get:
 *     summary: Get an evento by id [EVENTOS_READ]
 *     description: Get a specific evento by its ID . Requires EVENTOS_READ permission.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 nombre:
 *                   type: string
 *                 descripcion:
 *                   type: string
 *                 cupo:
 *                   type: number
 *                 precio:
 *                   type: number
 *                 sucursalId:
 *                   type: number
 *                 estadoId:
 *                   type: number
 *                 categoriaId:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions . EVENTOS_READ required.
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
 * /eventos:
 *   security:
 *     - bearerAuth: []
 *   post:
 *     summary: Create an evento [EVENTOS_MANAGE]
 *     description: Create a new evento with recurrences. Requires EVENTOS_MANAGE permission.
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
 *                 type: number
 *                 description: Cupo del evento debe ser un número mayor a 0
 *                 required: true
 *                 example: 50
 *               sucursalId:
 *                 type: number
 *                 description: ID de la sucursal a la que pertenece
 *                 required: true
 *                 example: 1
 *               estadoId:
 *                 type: number
 *                 description: ID del estado del evento
 *                 required: false
 *                 example: 1
 *               categoriaId:
 *                 type: number
 *                 description: ID de la categoría del evento
 *                 required: false
 *                 example: 1
 *               precio:
 *                 type: number
 *                 description: Precio del evento
 *                 required: true
 *                 example: 25.50
 *               recurrencias:
 *                 type: array
 *                 description: Array de recurrencias del evento mínimo 1 recurrencia
 *                 required: true
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   properties:
 *                     dia:
 *                       type: string
 *                       description: Día de la semana Lunes Martes Miércoles Jueves Viernes Sábado Domingo
 *                       enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
 *                       example: "Lunes"
 *                     hora:
 *                       type: string
 *                       description: Hora del evento formato HH:MM desde 08:00 hasta 23:30
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
 *     responses:
 *       201:
 *         description: Evento created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 nombre:
 *                   type: string
 *                 descripcion:
 *                   type: string
 *                 cupo:
 *                   type: number
 *                 precio:
 *                   type: number
 *                 sucursalId:
 *                   type: number
 *                 estadoId:
 *                   type: number
 *                 categoriaId:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions. EVENTOS_MANAGE required.
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
  '',
  authMiddleware,
  requirePermissions([Permissions.EVENTOS_MANAGE]),
  sucursalAuthMiddleware,
  controller.create,
);

/**
 * @openapi
 * /eventos/{id}:
 *   security:
 *     - bearerAuth: []
 *   put:
 *     summary: Update an evento [EVENTOS_MANAGE]
 *     description: Update an existing evento . Requires EVENTOS_MANAGE permission.
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
 *                 type: number
 *                 description: Cupo del evento debe ser un número mayor a 0
 *                 example: 50
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
 *                 description: Array de recurrencias del evento mínimo 1 recurrencia
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   properties:
 *                     dia:
 *                       type: string
 *                       description: Día de la semana Lunes Martes Miércoles Jueves Viernes Sábado Domingo
 *                       enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
 *                       example: "Martes"
 *                     hora:
 *                       type: string
 *                       description: Hora del evento formato HH:MM desde 08:00 hasta 23:30
 *                       enum: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"]
 *                       example: "19:00"
 *                     fecha_desde:
 *                       type: string
 *                       format: date
 *                       description: Fecha desde la cual comienza la recurrencia
 *                       example: "2027-02-01"
 *                     fecha_hasta:
 *                       type: string
 *                       format: date
 *                       description: Fecha hasta la cual termina la recurrencia
 *                       example: "2027-11-30"
 *     responses:
 *       200:
 *         description: Evento updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 nombre:
 *                   type: string
 *                 descripcion:
 *                   type: string
 *                 cupo:
 *                   type: number
 *                 precio:
 *                   type: number
 *                 sucursalId:
 *                   type: number
 *                 estadoId:
 *                   type: number
 *                 categoriaId:
 *                   type: number
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions . EVENTOS_MANAGE required.
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.EVENTOS_MANAGE]),
  eventoAuthMiddleware,
  controller.update,
);

/**
 * @openapi
 * /eventos/{id}:
 *   security:
 *     - bearerAuth: []
 *   delete:
 *     summary: Delete an evento [EVENTOS_MANAGE]
 *     description: Delete an existing evento . Requires EVENTOS_MANAGE permission.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Evento eliminado exitosamente"
 *                 id:
 *                   type: number
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions . EVENTOS_MANAGE required.
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.EVENTOS_MANAGE]),
  eventoAuthMiddleware,
  controller.delete,
);

/**
 * @openapi
 * /eventos/{id}/instancias:
 *   get:
 *     summary: Get all instances of a specific event
 *     description: Get all instances of a specific event
 *     tags:
 *       - Eventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the evento
 *     responses:
 *       200:
 *         description: List of event instances retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       eventoId:
 *                         type: number
 *                       fecha:
 *                         type: string
 *                         format: date
 *                       hora:
 *                         type: string
 *                       estado:
 *                         type: string
 *                       cupoDisponible:
 *                         type: number
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: number
 *                     currentPage:
 *                       type: number
 *                     itemsPerPage:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/instancias', authMiddleware, controller.getInstanciasEvento);

/**
 * @openapi
 * /eventos/{id}/generar-instancias:
 *   security:
 *     - bearerAuth: []
 *   post:
 *     summary: Force generation of instances for a specific event [EVENTOS_MANAGE]
 *     description: Force generation of instances for a specific event . Requires EVENTOS_MANAGE permission.
 *     tags:
 *       - Eventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the evento
 *     responses:
 *       200:
 *         description: Event instances generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalInstanciasCreadas:
 *                   type: number
 *                   description: Total number of instances created
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions . EVENTOS_MANAGE required.
 *       404:
 *         description: Event not found or event has no recurrences
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:id/generar-instancias',
  authMiddleware,
  requirePermissions([Permissions.EVENTOS_MANAGE]),
  eventoAuthMiddleware,
  controller.generarInstanciasEvento,
);

/**
 * @openapi
 * /eventos/instancias/{instanciaId}/suspender:
 *   security:
 *     - bearerAuth: []
 *   put:
 *     summary: Suspend a specific instance of an event [EVENTOS_MANAGE]
 *     description: Suspend a specific instance of an event. Requires EVENTOS_MANAGE permission.
 *     tags:
 *       - Eventos
 *     parameters:
 *       - name: instanciaId
 *         in: path
 *         required: true
 *         description: The id of the instance to suspend
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Instance suspended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Instancia suspendida exitosamente"
 *                 instanciaId:
 *                   type: number
 *                 estado:
 *                   type: string
 *                   example: "SUSPENDIDA"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions . EVENTOS_MANAGE required.
 *       404:
 *         description: Instance not found
 *       500:
 *         description: Internal server error
 */
router.put(
  '/instancias/:instanciaId/suspender',
  authMiddleware,
  requirePermissions([Permissions.EVENTOS_MANAGE]),
  instanciaEventoAuthMiddleware,
  controller.suspenderInstanciaEvento,
);

/**
 * @openapi
 * /eventos/instancias/{instanciaId}/reactivar:
 *   security:
 *     - bearerAuth: []
 *   put:
 *     summary: Reactivate a specific instance of an event [EVENTOS_MANAGE]
 *     description: Reactivate a specific instance of an event. Requires EVENTOS_MANAGE permission.
 *     tags:
 *       - Eventos
 *     parameters:
 *       - name: instanciaId
 *         in: path
 *         required: true
 *         description: The id of the instance to reactivate
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Instance reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Instancia reactivada exitosamente"
 *                 instanciaId:
 *                   type: number
 *                 estado:
 *                   type: string
 *                   example: "ACTIVA"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions . EVENTOS_MANAGE required.
 *       404:
 *         description: Instance not found
 *       500:
 *         description: Internal server error
 */
router.put(
  '/instancias/:instanciaId/reactivar',
  authMiddleware,
  requirePermissions([Permissions.EVENTOS_MANAGE]),
  instanciaEventoAuthMiddleware,
  controller.reactivarInstanciaEvento,
);

logger.debug('Evento router initialized');

export default router;
