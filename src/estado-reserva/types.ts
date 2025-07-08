import { z } from 'zod';
import { createEstadoReservaSchema, updateEstadoReservaSchema } from './schema';

export type CreateEstadoReservaDto = z.infer<typeof createEstadoReservaSchema>;
export type UpdateEstadoReservaDto = z.infer<typeof updateEstadoReservaSchema>;
