import {Router} from 'express';
import {ReservaController} from './controller';
import {reservaService} from './service';

import logger from '@/logger';

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
 *       - name: fecha
 */
