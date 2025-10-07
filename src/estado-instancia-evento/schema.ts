import { z } from 'zod';
import { EstadoInstanciaEventoEnum } from './enum';

export const createEstadoInstanciaEventoSchema = z.object({
  nombre: z.nativeEnum(EstadoInstanciaEventoEnum),
});

export const updateEstadoInstanciaEventoSchema = z.object({
  nombre: z.nativeEnum(EstadoInstanciaEventoEnum).optional(),
});
