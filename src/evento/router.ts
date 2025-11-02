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
import multer from 'multer';

const controller = new EventoController(eventoService);
const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Tipo de archivo no permitido. Solo se permiten imágenes y videos.',
        ),
      );
    }
  },
});

/**
 * @openapi
 * /eventos/instancias-eventos:
 *   get:
 *     summary: Get all event instances with filtering options
 *     tags:
 *       - Eventos
 *     parameters:
 *       - name: eventoId
 *         in: query
 *         description: Filter by specific evento ID
 *         schema:
 *           type: integer
 *       - name: recurrenciaEventoId
 *         in: query
 *         description: Filter by specific recurrence ID
 *         schema:
 *           type: integer
 *       - name: estadoId
 *         in: query
 *         description: Filter by instance state ID
 *         schema:
 *           type: integer
 *       - name: fechaDesde
 *         in: query
 *         description: Filter instances from this date
 *         schema:
 *           type: string
 *           format: date
 *       - name: fechaHasta
 *         in: query
 *         description: Filter instances until this date
 *         schema:
 *           type: string
 *           format: date
 *       - name: bodegaId
 *         in: query
 *         description: Filter by bodega ID (automatically set for authenticated users)
 *         schema:
 *           type: integer
 *       - name: sucursalId
 *         in: query
 *         description: Filter by sucursal ID
 *         schema:
 *           type: integer
 *       - name: categoriaEventoId
 *         in: query
 *         description: Filter by event category ID
 *         schema:
 *           type: integer
 *       - name: precioMinimo
 *         in: query
 *         description: Filter by minimum price
 *         schema:
 *           type: number
 *       - name: precioMaximo
 *         in: query
 *         description: Filter by maximum price
 *         schema:
 *           type: number
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: orderBy
 *         in: query
 *         description: Field to order by
 *         schema:
 *           type: string
 *           enum: [id, fecha, eventoId, recurrenciaEventoId, estadoId, created_at, updated_at, deleted_at]
 *       - name: orderDirection
 *         in: query
 *         description: Order direction
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get(
  '/instancias',
  authMiddleware,
  requirePermissions([Permissions.EVENTOS_READ]),
  controller.getInstanciasEventos,
);

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
 * /eventos/mi-bodega:
 *   get:
 *     summary: Get eventos de mi bodega
 *     description: Get eventos filtrados por la bodega del usuario autenticado
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
 *         description: List of eventos from user's bodega retrieved successfully
 *       400:
 *         description: Bad request - Invalid filter parameters
 *       500:
 *         description: Internal server error
 */
router.get('/mi-bodega', authMiddleware, controller.getAllByBodega);

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
 *     description: Create a new evento with recurrences and multimedia files. Requires EVENTOS_MANAGE permission.
 *     tags:
 *       - Eventos
 *     requestBody:
 *       content:
 *         multipart/form-data:
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
 *                 description: Cupo del evento debe ser un número mayor a 0
 *                 example: "50"
 *               sucursalId:
 *                 type: string
 *                 description: ID de la sucursal a la que pertenece
 *                 example: "1"
 *               estadoId:
 *                 type: string
 *                 description: ID del estado del evento
 *                 example: "1"
 *               categoriaId:
 *                 type: string
 *                 description: ID de la categoría del evento
 *                 example: "1"
 *               precio:
 *                 type: string
 *                 description: Precio del evento
 *                 example: "25.50"
 *               recurrencias:
 *                 type: string
 *                 description: JSON string con array de recurrencias del evento mínimo 1 recurrencia
 *                 example: '[{"dia":"Lunes","hora":"18:00","fecha_desde":"2026-01-01","fecha_hasta":"2026-12-31"}]'
 *               multimediaPortada:
 *                 type: string
 *                 description: Nombre del archivo multimedia que será la portada del evento
 *                 example: "portada.jpg"
 *               multimedia:
 *                 type: array
 *                 description: Array de archivos multimedia (imágenes y videos)
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *     responses:
 *       201:
 *         description: Evento created successfully
 *       400:
 *         description: Bad request - Invalid form data or file validation failed
 *       413:
 *         description: Payload too large - File size exceeds limit
 *       500:
 *         description: Internal server error
 */
router.post(
  '',
  authMiddleware,
  requirePermissions([Permissions.EVENTOS_MANAGE]),
  upload.array('multimedia', 10), // Handle up to 10 multimedia files
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
 *     description: Update an existing evento with multimedia files. Requires EVENTOS_MANAGE permission.
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
 *         multipart/form-data:
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
 *                 description: Cupo del evento debe ser un número mayor a 0
 *                 example: "50"
 *               sucursalId:
 *                 type: string
 *                 description: ID de la sucursal a la que pertenece
 *                 example: "1"
 *               estadoId:
 *                 type: string
 *                 description: ID del estado del evento
 *                 example: "1"
 *               categoriaId:
 *                 type: string
 *                 description: ID de la categoría del evento
 *                 example: "1"
 *               precio:
 *                 type: string
 *                 description: Precio del evento
 *                 example: "25.50"
 *               recurrencias:
 *                 type: string
 *                 description: JSON string con array de recurrencias del evento mínimo 1 recurrencia
 *                 example: '[{"dia":"Lunes","hora":"18:00","fecha_desde":"2026-01-01","fecha_hasta":"2026-12-31"}]'
 *               removeMultimedia:
 *                 type: string
 *                 description: JSON string con array de IDs de multimedia a eliminar
 *                 example: '[1, 2, 3]'
 *               multimediaPortada:
 *                 type: string
 *                 description: Nombre del archivo multimedia que será la portada del evento
 *                 example: "portada.jpg"
 *               multimedia:
 *                 type: array
 *                 description: Array de archivos multimedia (imágenes y videos) a agregar
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
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
 *         description: Bad request - Invalid form data or file validation failed
 *       413:
 *         description: Payload too large - File size exceeds limit
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.EVENTOS_MANAGE]),
  eventoAuthMiddleware,
  upload.array('multimedia', 10), // Handle up to 10 multimedia files
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
 *     description: Get all instances of a specific event with optional filters
 *     tags:
 *       - Eventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the evento
 *       - name: fechaDesde
 *         in: query
 *         required: false
 *         description: Filter instances from this date
 *         schema:
 *           type: string
 *           format: date
 *       - name: fechaHasta
 *         in: query
 *         required: false
 *         description: Filter instances until this date
 *         schema:
 *           type: string
 *           format: date
 *       - name: estadoId
 *         in: query
 *         required: false
 *         description: Filter by estado id
 *         schema:
 *           type: number
 *       - name: recurrenciaEventoId
 *         in: query
 *         required: false
 *         description: Filter by recurrencia id
 *         schema:
 *           type: number
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number
 *         schema:
 *           type: number
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Items per page
 *         schema:
 *           type: number
 *           default: 1000
 *       - name: orderBy
 *         in: query
 *         required: false
 *         description: Order by field (e.g., 'fecha:asc' or 'fecha:desc')
 *         schema:
 *           type: string
 *           default: 'id:asc'
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

/**
 * @openapi
 * /eventos/instancias/{instanciaId}/reservas:
 *   security:
 *     - bearerAuth: []
 *   get:
 *     summary: Get all reservations of a specific instance of an event [EVENTOS_MANAGE]
 *     description: Get all reservations of a specific instance of an event. Requires EVENTOS_MANAGE permission.
 *     tags:
 *       - Eventos
 *     parameters:
 *       - name: instanciaId
 *         in: path
 *         required: true
 *         description: The id of the instance to get the reservations from
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Reservas retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                     description: ID único de la reserva
 *                   instanciaEventoId:
 *                     type: number
 *                     description: ID de la instancia del evento
 *                   recorridoId:
 *                     type: number
 *                     description: ID del recorrido asociado
 *                   precio:
 *                     type: number
 *                     format: decimal
 *                     description: Precio de la reserva
 *                   cantidadGente:
 *                     type: number
 *                     description: Cantidad de personas en la reserva
 *                   estados:
 *                     type: array
 *                     description: Estados de la reserva
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                           description: ID del estado
 *                         nombre:
 *                           type: string
 *                           description: Nombre del estado
 *                   user:
 *                     type: object
 *                     description: Usuario propietario de la reserva
 *                     properties:
 *                       id:
 *                         type: number
 *                         description: ID del usuario
 *                       nombre:
 *                         type: string
 *                         description: Nombre del usuario
 *                       apellido:
 *                         type: string
 *                         description: Apellido del usuario
 *                       email:
 *                         type: string
 *                         format: email
 *                         description: Email del usuario
 *                       validado:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha de validación del usuario
 *                       fecha_nacimiento:
 *                         type: string
 *                         format: date
 *                         description: Fecha de nacimiento del usuario
 *                       bodegaId:
 *                         type: number
 *                         description: ID de la bodega asignada al usuario
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de creación
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de última actualización
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions . EVENTOS_MANAGE required.
 *       404:
 *         description: Instance not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/instancias/:instanciaId/reservas',
  authMiddleware,
  requirePermissions([Permissions.EVENTOS_MANAGE]),
  instanciaEventoAuthMiddleware,
  controller.obtenerReservasInstancia,
);

/**
 * @openapi
 * /eventos/{id}/can-delete:
 *   get:
 *     summary: Check if an evento can be deleted
 *     tags:
 *       - Eventos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the evento
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
 *                   description: Whether the evento can be deleted
 *                 reason:
 *                   type: string
 *                   description: Reason why it cannot be deleted (if applicable)
 *       404:
 *         description: Evento not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id/can-delete',
  authMiddleware,
  requirePermissions([Permissions.EVENTOS_MANAGE]),
  eventoAuthMiddleware,
  controller.canDelete,
);

logger.debug('Evento router initialized');

export default router;
