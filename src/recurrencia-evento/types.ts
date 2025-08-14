import { z } from 'zod';
import {
  createRecurrenciaEventoSchema,
  updateRecurrenciaEventoSchema,
  findAllRecurrenciaEventoParamsSchema,
  idParamSchema,
  createManyRecurrenciaEventoSchema,
} from './schema';

export type CreateRecurrenciaEventoDto = z.infer<
  typeof createRecurrenciaEventoSchema
>;
export type UpdateRecurrenciaEventoDto = z.infer<
  typeof updateRecurrenciaEventoSchema
>;
export type FindAllRecurrenciaEventoParams = z.infer<
  typeof findAllRecurrenciaEventoParamsSchema
>;
export type IdParam = z.infer<typeof idParamSchema>;
export type CreateManyRecurrenciaEventoDto = z.infer<
  typeof createManyRecurrenciaEventoSchema
>;
