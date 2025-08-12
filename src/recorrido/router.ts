import { Router } from 'express';
import { RecorridoController } from './controller';
import { recorridoService } from './service';
//import {logger } from '@logger';

const controller = new RecorridoController(recorridoService);
const router = Router();
 
    /**
     * @openapi
     * /recorridos:
     *  get:
     *    summary: Get all recorridos
     *   tags:
     *      - Recorridos
     *    responses:
     *      200:
     *       description: Success
     */
router.get('', controller.getAll);
/** 
 * @openapi
 * /recorridos/{id}:
 *  get:
 *   summary: Get a recorrido by id
 * *   tags:
 *      - Recorridos
 * *   parameters:
 * *     - name: id
 * *       in: path
 * *       required: true
 * *       description: The id of the recorrido
 *     responses:
 *       200:
 *         description: Sucursal created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('', controller.create);