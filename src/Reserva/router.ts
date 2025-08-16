import {Router} from 'express';
import {ReservaController} from './controller';
import {reservaService} from './service';

//import logger from '@/logger';

const controller = new ReservaController(reservaService);
const router = Router();

/**
 * @openapi
 * /reservas:
 *   get:
 *     summary: Get all reservas
 *     tags:
 *       - Reservas
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
 *      responses:
 *        200:
 *        description: Reserva created successfully
 *      400:
 *       description: Bad request
 *     500:
 *    description: Internal server error
 * 
 */
router.get('', controller.getAll);
/**
 * @openapi
 * /reservas/{id}:
 *   get:
 *     summary: Get a reserva by ID
 *     tags:
 *       - Reservas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the reserva to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva retrieved successfully
 *       404:
 *         description: Reserva not found
 */
router.get('/:id', controller.getOne);

/**
 * @openapi
 * /reservas:
 *   post:
 * summary: Create a new reserva
 * tags:
 *   - Reservas
 * parameters:
 * - name: reserva
 *   in: body
 * description: Reserva object to create
 * required: true
 * schema:
 *   type: object
 * properties:
 * id:
 * required: true
 * response:
 * 200:
 * description: Reserva created successfully
 * 400:
 * description: Bad request
 * 500:
 * description: Internal server error
 */
router.post('', controller.create);


