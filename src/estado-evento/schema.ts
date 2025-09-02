import { z } from 'zod';
import { EstadoEvento } from './enum';

export const createEstadoEventoSchema = z.object({
  nombre: z.nativeEnum(EstadoEvento, {
    required_error: 'El estado es requerido',
    invalid_type_error: 'El estado debe ser un valor válido',
  }),
});

export const updateEstadoEventoSchema = z.object({
  nombre: z.nativeEnum(EstadoEvento, {
    invalid_type_error: 'El estado debe ser un valor válido',
  }).optional(),
});
