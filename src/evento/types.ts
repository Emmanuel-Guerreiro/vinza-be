import { z } from 'zod';
import {
  findAllParamsSchema,
  createEventoSchema,
  updateEventoSchema,
} from './schema';
import { DiaSemana, HoraEvento } from '@/recurrencia-evento/model';
import { Evento } from './model';

export type CreateEventoDto = z.infer<typeof createEventoSchema>;
export type UpdateEventoDto = z.infer<typeof updateEventoSchema>;
export type FindAllParams = z.infer<typeof findAllParamsSchema>;

export type RecurrenciaDto = {
  dia: DiaSemana;
  hora: HoraEvento;
  fecha_desde: Date;
  fecha_hasta: Date;
};

// Extended Evento type that includes the calculated average rating
export interface EventoWithRating extends Evento {
  promedioValoracion: number;
}

export interface FindAllRequest extends Request {
  query: FindAllParams;
}
