import { z } from 'zod';

export const createEstadoEventoSchema = z.object({
  nombre: z.string().min(1, 'El estado es requerido'),
});

export const updateEstadoEventoSchema = z.object({
  nombre: z.string().min(1, 'El estado es requerido').optional(),
});
