import { z } from 'zod';
import {
  createReservaSchema,
  reservaFilterSchema,
  updateReservaSchema,
} from './schema';

export type CreateReservaDto = z.infer<typeof createReservaSchema>;
export type UpdateReservaDto = z.infer<typeof updateReservaSchema>;

export type ReservaFilterParams = z.infer<typeof reservaFilterSchema>;
