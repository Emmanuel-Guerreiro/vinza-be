import { z } from 'zod';
import { MultimediaTargetEnum, TipoMultimediaEnum } from './enum';

export const createMultimediaFromFileSchema = z.object({
  multimediaTarget: z.nativeEnum(MultimediaTargetEnum),
  tipo: z.nativeEnum(TipoMultimediaEnum),
});

export type CreateMultimediaFromFileSchema = z.infer<
  typeof createMultimediaFromFileSchema
>;
