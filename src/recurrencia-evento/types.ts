import { z } from 'zod';
import { createRecurrenciaEventoSchema, updateRecurrenciaEventoSchema } from './schema';

export type CreateRecurrenciaEventoDto = z.infer<typeof createRecurrenciaEventoSchema>;
export type UpdateRecurrenciaEventoDto = z.infer<typeof updateRecurrenciaEventoSchema>;

