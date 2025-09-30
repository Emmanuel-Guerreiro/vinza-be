import { paginationAndOrderSchema } from '@/pagination/schemas';
import { z } from 'zod';

export const UpdateBodegaSchema = z.object({
  nombre: z.string().optional(),
  descripcion: z.string().optional(),
});

export const createBodegaSchema = z.object({
  nombre: z.string(),
  descripcion: z.string(),
  direccion: z.string(),
  telefono: z.string(),
  aclaraciones: z.string().optional(),
  firstUserId: z.coerce.number(),
});

const bodegaOrderByAttributes = [
  'id',
  'nombre',
  'descripcion',
  'created_at',
  'updated_at',
  'deleted_at',
];

export const findAllParamsSchema = paginationAndOrderSchema(
  bodegaOrderByAttributes,
).extend({
  nombre: z.string().optional(),
});

export const validateBodegaSchema = z.object({
  es_valida: z.boolean(),
});
