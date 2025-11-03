import { z } from 'zod';

export const createEstadoEventoSchema = z.object({
  nombre: z.string().min(1, 'El estado es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
});

export const updateEstadoEventoSchema = z.object({
  nombre: z.string().min(1, 'El estado es requerido').optional(),
  descripcion: z.string().min(1, 'La descripción es requerida').optional(),
});
