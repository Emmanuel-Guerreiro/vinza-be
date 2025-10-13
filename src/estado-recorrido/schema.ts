import { z } from 'zod';

export const createEstadoRecorridoSchema = z.object({
  nombre: z.string().min(1, 'El estado es requerido'),
});

export const updateEstadoRecorridoSchema = z.object({
  nombre: z.string().min(1, 'El estado es requerido').optional(),
});
