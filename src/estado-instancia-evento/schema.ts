import { z } from 'zod';

export const createEstadoInstanciaEventoSchema = z.object({
  nombre: z.string().min(1, 'El estado es requerido'),
});

export const updateEstadoInstanciaEventoSchema = z.object({
  nombre: z.string().optional(),
});
