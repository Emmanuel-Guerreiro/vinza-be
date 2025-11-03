import { z } from 'zod';
import { DiaSemana, HoraEvento } from './model';
import {
  createEventoSchema,
  createEventoWithMultimediaSchema,
  findAllParamsSchema,
  updateEventoSchema,
  updateEventoWithMultimediaSchema,
} from './schema';

export type CreateEventoDto = z.infer<typeof createEventoSchema>;

export type CreateEventoWithMultimediaDto = z.infer<
  typeof createEventoWithMultimediaSchema
>;

export type UpdateEventoDto = z.infer<typeof updateEventoSchema>;

export type UpdateEventoWithMultimediaDto = z.infer<
  typeof updateEventoWithMultimediaSchema
>;
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
