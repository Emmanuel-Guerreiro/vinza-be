import { Router } from 'express';
import { BodegaController } from './controller';
import { bodegaService } from './service';
import logger from '@/logger';
import multer from 'multer';
import { authMiddleware } from '@/auth/middleware';
import { uniqueBodegaPerUserMiddleware } from './middleware';

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

logger.debug('Bodega router initialized');

export default router;
