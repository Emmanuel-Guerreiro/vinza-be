import { z } from 'zod';
import { BodegaCreationAttributes } from './model';
import { findAllParamsSchema } from './schema';

export type CreateBodegaDto = BodegaCreationAttributes;

export type UpdateBodegaDto = Partial<CreateBodegaDto>;

export type FindAllParams = z.infer<typeof findAllParamsSchema>;
