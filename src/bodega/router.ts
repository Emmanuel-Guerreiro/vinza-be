import { Router } from 'express';
import { BodegaController } from './controller';
import { bodegaService } from './service';
import logger from '@/logger';
import multer from 'multer';
import { authMiddleware } from '@/auth/middleware';
import { uniqueBodegaPerUserMiddleware } from './middleware';
import { requirePermissions } from '@/rbac/middleware';
import { Permissions } from '@/rbac/permissions';

const controller = new BodegaController(bodegaService);
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
 *     summary: Create a bodega with multimedia files
 *     description: Create a new bodega with multimedia files. Supports form data with file uploads.
 *     tags:
 *       - Bodegas
 *     requestBody:
 *       content:
 *         multipart/form-data:
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
 *               multimediaPortada:
 *                 type: string
 *                 description: Nombre del archivo multimedia que será la portada de la bodega
 *                 example: "portada.jpg"
 *               multimedia:
 *                 type: array
 *                 description: Array de archivos multimedia (imágenes y videos)
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
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
 *         description: Bad request - Invalid form data or file validation failed
 *       413:
 *         description: Payload too large - File size exceeds limit
 *       500:
 *         description: Internal server error
 */
router.post(
  '',
  authMiddleware,
  uniqueBodegaPerUserMiddleware,
  upload.array('multimedia', 10), // Handle up to 10 multimedia files
  controller.create,
);

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

/**
 * @openapi
 * /bodegas/{id}/metrics:
 *   get:
 *     summary: Get bodega metrics
 *     tags:
 *       - Bodegas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the bodega
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bodega metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventosActivos:
 *                   type: integer
 *                   description: Number of active events
 *                   example: 15
 *                 personalActivo:
 *                   type: integer
 *                   description: Number of active users in the organization
 *                   example: 8
 *                 puntuacionPromedio:
 *                   type: number
 *                   description: Average rating of all events in the bodega
 *                   example: 4.2
 *                 bodegasActivas:
 *                   type: integer
 *                   description: Number of active sucursales
 *                   example: 3
 *                 tasaOcupacion:
 *                   type: number
 *                   description: Occupation rate percentage
 *                   example: 75.5
 *                 ingresosMensuales:
 *                   type: number
 *                   description: Monthly revenue from confirmed reservations
 *                   example: 12500.75
 *                 historialIngresosMensuales:
 *                   type: array
 *                   description: Last 5 months revenue history
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         description: Month in YYYY-MonthName format (Spanish)
 *                         example: "2024-enero"
 *                       ingresos:
 *                         type: number
 *                         description: Revenue for that month
 *                         example: 8500.25
 *                 eventosPorCategoria:
 *                   type: array
 *                   description: Number of events per category
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoria:
 *                         type: string
 *                         description: Category name
 *                         example: "Degustación de Vinos"
 *                       cantidad:
 *                         type: integer
 *                         description: Number of events in this category
 *                         example: 5
 *                 ocupacionSemanal:
 *                   type: array
 *                   description: Weekly occupation for the next 7 days (including today)
 *                   items:
 *                     type: object
 *                     properties:
 *                       dia:
 *                         type: string
 *                         description: Day name in Spanish
 *                         example: "lunes"
 *                       fecha:
 *                         type: string
 *                         description: Date in YYYY-MM-DD format
 *                         example: "2024-12-16"
 *                       reservasConfirmadas:
 *                         type: integer
 *                         description: Number of confirmed reservations for this day
 *                         example: 8
 *       400:
 *         description: Bad request
 *       404:
 *         description: Bodega not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/metrics', controller.getMetrics);

logger.debug('Bodega router initialized');

export default router;
