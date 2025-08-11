import { z } from 'zod';
import {
  findAllParamsSchema,
  createEventoSchema,
  updateEventoSchema,
} from './schema';
import { DiaSemana, HoraEvento } from '@/recurrencia-evento/model';

export type CreateEventoDto = z.infer<typeof createEventoSchema>;
export type UpdateEventoDto = z.infer<typeof updateEventoSchema>;
export type FindAllParams = z.infer<typeof findAllParamsSchema>;

export type RecurrenciaDto = {
  dia: DiaSemana;
  hora: HoraEvento;
  fecha_desde: Date;
  fecha_hasta: Date;
};

export interface FindAllRequest extends Request {
  query: FindAllParams;
}
