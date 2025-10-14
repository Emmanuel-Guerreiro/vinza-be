import { z } from 'zod';
import { MultimediaTargetEnum, TipoMultimediaEnum } from './enum';

export const createMultimediaFromFileSchema = z.object({
  multimediaTarget: z.nativeEnum(MultimediaTargetEnum),
  tipo: z.nativeEnum(TipoMultimediaEnum),
  es_portada: z.boolean().optional(),
});

export type CreateMultimediaFromFileSchema = z.infer<
  typeof createMultimediaFromFileSchema
>;
