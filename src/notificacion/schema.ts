import { z } from 'zod';

export const sendNotificationSchema = z.object({
  userId: z.coerce.number(),
  titulo: z.string().min(1),
  descripcion: z.string().min(1),
  data: z.record(z.unknown()).optional(),
});

export const descartarNotificacionSchema = z.object({
  eventoId: z.coerce.number().int().positive(),
});
