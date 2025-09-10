import { z } from 'zod';
import { EstadoEventoEnum } from './enum';

export const createEstadoEventoSchema = z.object({
  nombre: z.nativeEnum(EstadoEventoEnum, {
    required_error: 'El estado es requerido',
    invalid_type_error: 'El estado debe ser un valor válido',
  }),
});

export const updateEstadoEventoSchema = z.object({
  nombre: z
    .nativeEnum(EstadoEventoEnum, {
      invalid_type_error: 'El estado debe ser un valor válido',
    })
    .optional(),
});
