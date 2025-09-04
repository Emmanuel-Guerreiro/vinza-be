import { z } from 'zod';
import {
  createEstadoRecorridoSchema,
  updateEstadoRecorridoSchema,
} from './schema';

export type CreateEstadoRecorridoDto = z.infer<
  typeof createEstadoRecorridoSchema
>;
export type UpdateEstadoRecorridoDto = z.infer<
  typeof updateEstadoRecorridoSchema
>;
