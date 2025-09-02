import { z } from 'zod';
import {
  createEstadoInstanciaEventoSchema,
  updateEstadoInstanciaEventoSchema,
  findAllEstadoInstanciaEventoSchema,
} from './schema';

export type CreateEstadoInstanciaEventoDto = z.infer<
  typeof createEstadoInstanciaEventoSchema
>;
export type UpdateEstadoInstanciaEventoDto = z.infer<
  typeof updateEstadoInstanciaEventoSchema
>;
export type FindAllParams = z.infer<typeof findAllEstadoInstanciaEventoSchema>;
