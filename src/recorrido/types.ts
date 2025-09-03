import { z } from 'zod';
import { RecorridoCreationAttributes } from './model';
import { findAllRecorridosParamsSchema } from './schema';
export type CreateRecorridoDto = RecorridoCreationAttributes;

export type UpdateRecorridoDto = Partial<CreateRecorridoDto>;

export type FindAllRecorridosParams = z.infer<
  typeof findAllRecorridosParamsSchema
>;
