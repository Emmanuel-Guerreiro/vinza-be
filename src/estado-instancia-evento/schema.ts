import { z } from 'zod';

export const createEstadoInstanciaEventoSchema = z.object({
  nombre: z.string().min(1, 'El estado es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
});

export const updateEstadoInstanciaEventoSchema = z.object({
  nombre: z.string().optional(),
  descripcion: z.string().min(1, 'La descripción es requerida').optional(),
});
