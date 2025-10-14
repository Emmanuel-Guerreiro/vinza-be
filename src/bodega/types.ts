import z from 'zod';
import {
  createBodegaSchema,
  createBodegaWithMultimediaSchema,
  findAllParamsSchema,
  validateBodegaSchema,
} from './schema';

export type CreateBodegaDto = z.infer<typeof createBodegaSchema>;

export type CreateBodegaWithMultimediaDto = z.infer<
  typeof createBodegaWithMultimediaSchema
>;

export type UpdateBodegaDto = Partial<CreateBodegaDto>;

export type FindAllParams = z.infer<typeof findAllParamsSchema>;

export type ValidateBodegaDto = z.infer<typeof validateBodegaSchema>;
