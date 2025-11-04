import { z } from 'zod';

export const createEstadoReservaSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
});

export const updateEstadoReservaSchema = z.object({
  nombre: z.string().optional(),
  descripcion: z.string().min(1, 'La descripción es requerida').optional(),
});

export type EstadoReservaOrderByAttributes = [
  'id',
  'nombre',
  'created_at',
  'updated_at',
  'deleted_at',
];
