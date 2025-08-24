import { z } from 'zod';
import { createReservaSchema, findAllParamsSchema } from './schema';

export type CreateReservaDto = z.infer<typeof createReservaSchema>;
export type UpdateReservaDto = Partial<CreateReservaDto>;
export type FindAllParams = z.infer<typeof findAllParamsSchema>;

export interface FindAllRequest extends Request {
  query: FindAllParams;
}
