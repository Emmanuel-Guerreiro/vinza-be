import { EstadoRecorridoEnum } from '@/estado-recorrido/enum';
import { paginationAndOrderSchema } from '@/pagination/schemas';
import { z } from 'zod';

export const updateRecorridoSchema = z.object({
  userId: z.number().optional(),
  last_optimization: z.date().nullable().optional(),
  deleted_at: z.date().nullable().optional(),
  created_at: z.date().optional(),
});

export const createRecorridoSchema = z.object({
  userId: z.number().int().positive(),
});

const recorridoOrderByAttributes = ['id', 'created_at', 'deleted_at'];
export const findAllRecorridosParamsSchema = paginationAndOrderSchema(
  recorridoOrderByAttributes,
).extend({
  userId: z.number().int().positive().optional(),
  estados: z.nativeEnum(EstadoRecorridoEnum).optional(),
});
