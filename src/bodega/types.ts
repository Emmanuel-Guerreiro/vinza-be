import { z } from 'zod';
import { BodegaCreationAttributes } from './model';
import {
  createBodegaWithMultimediaSchema,
  findAllParamsSchema,
} from './schema';

export type CreateBodegaDto = BodegaCreationAttributes;

export type CreateBodegaWithMultimediaDto = z.infer<
  typeof createBodegaWithMultimediaSchema
>;

export type UpdateBodegaDto = Partial<CreateBodegaDto>;

export type FindAllParams = z.infer<typeof findAllParamsSchema>;
