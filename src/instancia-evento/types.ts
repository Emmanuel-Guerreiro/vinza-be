import { z } from 'zod';
import { findAllParamsSchema, createInstanciaEventoSchema, updateInstanciaEventoSchema } from './schema';
import { InstanciaEvento } from './model';

export type CreateInstanciaEventoDto = z.infer<typeof createInstanciaEventoSchema>;
export type UpdateInstanciaEventoDto = z.infer<typeof updateInstanciaEventoSchema>;
export type FindAllParams = z.infer<typeof findAllParamsSchema>;

export interface InstanciaEventoWithRelations extends InstanciaEvento {
  evento?: any;
  recurrenciaEvento?: any;
  estado?: any;
}

export interface FindAllRequest extends Request {
  query: FindAllParams;
}

