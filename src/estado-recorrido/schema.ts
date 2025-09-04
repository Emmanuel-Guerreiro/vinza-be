import { z } from 'zod';
import { EstadoRecorridoEnum } from './enum';

export const createEstadoRecorridoSchema = z.object({
  nombre: z.nativeEnum(EstadoRecorridoEnum),
});

export const updateEstadoRecorridoSchema = z.object({
  nombre: z.nativeEnum(EstadoRecorridoEnum).optional(),
});
