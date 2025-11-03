import { z } from 'zod';

export const createEstadoRecorridoSchema = z.object({
  nombre: z.string().min(1, 'El estado es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
});

export const updateEstadoRecorridoSchema = z.object({
  nombre: z.string().min(1, 'El estado es requerido').optional(),
  descripcion: z.string().min(1, 'La descripción es requerida').optional(),
});
