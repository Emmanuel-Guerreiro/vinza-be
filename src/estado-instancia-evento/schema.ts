import { z } from 'zod';
import { paginationAndOrderSchema } from '@/pagination/schemas';

export const createEstadoInstanciaEventoSchema = z.object({
  nombre: z.string(),
});

export const updateEstadoInstanciaEventoSchema = z.object({
  nombre: z.string().optional(),
});

export const findAllEstadoInstanciaEventoSchema = paginationAndOrderSchema([
  'id',
  'nombre',
  'created_at',
  'updated_at',
]);
