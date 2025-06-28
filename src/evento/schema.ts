import { paginationAndOrderSchema } from '@/pagination/schemas';
import { z } from 'zod';

export const createEventoSchema = z.object({
  nombre: z.string(),
  descripcion: z.string(),
  cupo: z.string(),
  sucursalId: z.number(),
  estadoId: z.number(),
  categoriaId: z.number(),
  precio: z.number(),
});

export const updateEventoSchema = z.object({
  nombre: z.string().optional(),
  descripcion: z.string().optional(),
  cupo: z.string().optional(),
  sucursalId: z.number().optional(),
  estadoId: z.number().optional(),
  categoriaId: z.number().optional(),
  precio: z.number().optional(),
});

// Valid attributes from the Evento model for ordering
const eventoOrderByAttributes = [
  'id',
  'nombre',
  'precio',
  'descripcion',
  'cupo',
  'sucursalId',
  'created_at',
  'updated_at',
  'deleted_at',
];

export const findAllParamsSchema = paginationAndOrderSchema(
  eventoOrderByAttributes,
).extend({
  sucursalId: z.coerce.number().optional(),
  categoriaId: z.coerce.number().optional(),
  estadoId: z.coerce.number().optional(),
  bodegaId: z.string().optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  precioMaximo: z.coerce.number().min(0).optional(),
  puntuacionMinima: z.coerce.number().min(0).max(5).optional(),
  nombre: z.string().optional(),
});
