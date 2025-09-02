import { z } from 'zod';

export const createEstadoReservaSchema = z.object({
  nombre: z.string(),
});

export const updateEstadoReservaSchema = z.object({
  nombre: z.string().optional(),
});

export type EstadoReservaOrderByAttributes = [
  'id',
  'nombre',
  'created_at',
  'updated_at',
  'deleted_at',
];
