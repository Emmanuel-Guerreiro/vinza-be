import { EstadoReservaEnum } from '@/estado-reserva/enum';
import { paginationAndOrderSchema } from '@/pagination/schemas';
import { z } from 'zod';

export const createReservaSchema = z.object({
  userId: z.coerce.number(),
  cantidadGente: z.coerce.number(),
  instanciaEventoId: z.coerce.number(),
  recorridoId: z.coerce.number().optional(),
});

export const updateReservaSchema = z.object({
  cantidadGente: z.coerce.number(),
});

const reservaOrderByAttributes = [
  'id',
  'precio',
  'cantidadGente',
  'createdAt',
  'updatedAt',
];

export const reservaFilterSchema = paginationAndOrderSchema(
  reservaOrderByAttributes,
).extend({
  estado: z.nativeEnum(EstadoReservaEnum).optional(),
});
