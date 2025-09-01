import { z } from 'zod';
import {
  findAllParamsSchema,
  createInstanciaEventoSchema,
  updateInstanciaEventoSchema,
} from './schema';
import { InstanciaEvento } from './model';
import { Evento } from '@/evento/model';
import { RecurrenciaEvento } from '@/evento/model';
import { EstadoInstanciaEvento } from '@/estado-instancia-evento/model';

export type CreateInstanciaEventoDto = z.infer<
  typeof createInstanciaEventoSchema
>;
export type UpdateInstanciaEventoDto = z.infer<
  typeof updateInstanciaEventoSchema
>;
export type FindAllParams = z.infer<typeof findAllParamsSchema>;

export interface InstanciaEventoWithRelations extends InstanciaEvento {
  evento?: Evento;
  recurrenciaEvento?: RecurrenciaEvento;
  estado?: EstadoInstanciaEvento;
}

export interface FindAllRequest extends Request {
  query: FindAllParams;
}
