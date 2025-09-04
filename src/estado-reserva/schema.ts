import { z } from 'zod';
import { EstadoReservaEnum } from './enum';

export const createEstadoReservaSchema = z.object({
  nombre: z.nativeEnum(EstadoReservaEnum),
});

export const updateEstadoReservaSchema = z.object({
  nombre: z.nativeEnum(EstadoReservaEnum).optional(),
});

export type EstadoReservaOrderByAttributes = [
  'id',
  'nombre',
  'created_at',
  'updated_at',
  'deleted_at',
];
