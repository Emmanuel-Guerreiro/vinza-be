import { z } from 'zod';
import { EventoCreationAttributes } from './model';
import { findAllParamsSchema } from './schema';

export type CreateEventoDto = EventoCreationAttributes;
export type UpdateEventoDto = Partial<CreateEventoDto>;
export type FindAllParams = z.infer<typeof findAllParamsSchema>;

export interface FindAllRequest extends Request {
  query: FindAllParams;
}
