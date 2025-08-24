import { paginationAndOrderSchema } from '@/pagination/schemas';
import { z } from 'zod';

export const createReservaSchema = z.object({
  userId: z.number(),
  precio: z.number(),
  cantidadGente: z.number(),
  instanciaEventoId: z.number(),
  recorridoId: z.number().optional(),
});

export const updateReservaSchema = z.object({
  precio: z.number(),
  userId: z.number(),
  cantidadGente: z.number(), //solamente cantiad de personas se puede mofificar
  instanciaEventoId: z.number(),
  recorridoId: z.number(),
});

const reservaOrdenarAtributos = [
  'idReserva',
  'precio',
  'cantidadGente',
  'createdAt',
  'updatedAt',
];

export const findAllParamsSchema = paginationAndOrderSchema(
  reservaOrdenarAtributos,
).extend({
  instanciaEventoId: z.coerce.number().optional(),
  recorridoId: z.coerce.number().optional(),
  precioMaximo: z.coerce.number().min(0).optional(),
  cantidadGenteMinima: z.coerce.number().min(0).optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  precioMinimo: z.coerce.number().min(0).optional(),
  bodega: z.string().optional(),
});
