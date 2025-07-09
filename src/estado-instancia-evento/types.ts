import { z } from 'zod';
import { createEstadoInstanciaEventoSchema, updateEstadoInstanciaEventoSchema } from './schema';

export type CreateEstadoInstanciaEventoDto = z.infer<typeof createEstadoInstanciaEventoSchema>;
export type UpdateEstadoInstanciaEventoDto = z.infer<typeof updateEstadoInstanciaEventoSchema>;