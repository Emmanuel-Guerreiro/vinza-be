import { z } from 'zod';
import { DiaSemana, HoraEvento } from './model';
import {
  createEventoSchema,
  createEventoWithMultimediaSchema,
  findAllParamsSchema,
  updateEventoSchema,
} from './schema';

export type CreateEventoDto = z.infer<typeof createEventoSchema>;

export type CreateEventoWithMultimediaDto = z.infer<
  typeof createEventoWithMultimediaSchema
>;

export type UpdateEventoDto = z.infer<typeof updateEventoSchema> & {
  addMultimedia?: Express.Multer.File[];
};
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
