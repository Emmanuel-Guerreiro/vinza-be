import {z} from 'zod';
import { ReservaCreationAttributes } from './model';
import { findAllParamsSchema } from './schema';

export type CreateReservaDto = ReservaCreationAttributes;
export type UpdateReservaDto = Partial<CreateReservaDto>;
export type FindAllParams = z.infer<typeof findAllParamsSchema>;

export interface FindAllRequest extends Request {
  query: FindAllParams;
}