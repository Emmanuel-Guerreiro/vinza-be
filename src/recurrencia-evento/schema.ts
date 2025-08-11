import { z } from 'zod';
import { DiaSemana, HoraEvento } from './model';

export const findAllRecurrenciaEventoParamsSchema = z.object({
  eventoId: z.coerce
    .number()
    .positive('El ID del evento debe ser un número positivo')
    .optional(),
});

// Schema para validar path params (ID)
export const idParamSchema = z.coerce
  .number()
  .positive('El ID debe ser un número positivo');

export const createRecurrenciaEventoSchema = z
  .object({
    dia: z.nativeEnum(DiaSemana, {
      required_error: 'El día es requerido',
      invalid_type_error: 'El día debe ser un día válido de la semana',
    }),
    hora: z.nativeEnum(HoraEvento, {
      required_error: 'La hora es requerida',
      invalid_type_error: 'La hora debe ser una hora válida',
    }),
    fecha_desde: z.coerce.date().refine((date) => date > new Date(), {
      message: 'La fecha desde debe ser posterior a la fecha actual',
      path: ['fecha_desde'],
    }),
    fecha_hasta: z.coerce.date().refine((date) => date > new Date(), {
      message: 'La fecha hasta debe ser posterior a la fecha actual',
      path: ['fecha_hasta'],
    }),
    eventoId: z
      .number()
      .positive('El ID del evento debe ser un número positivo'),
  })
  .refine((data) => data.fecha_hasta > data.fecha_desde, {
    message: 'La fecha hasta debe ser posterior a la fecha desde',
    path: ['fecha_hasta'],
  });

export const updateRecurrenciaEventoSchema = z
  .object({
    dia: z
      .nativeEnum(DiaSemana, {
        invalid_type_error: 'El día debe ser un día válido de la semana',
      })
      .optional(),
    hora: z
      .nativeEnum(HoraEvento, {
        invalid_type_error: 'La hora debe ser una hora válida',
      })
      .optional(),
    fecha_desde: z.coerce
      .date()
      .refine((date) => date > new Date(), {
        message: 'La fecha desde debe ser posterior a la fecha actual',
        path: ['fecha_desde'],
      })
      .optional(),
    fecha_hasta: z.coerce
      .date()
      .refine((date) => date > new Date(), {
        message: 'La fecha hasta debe ser posterior a la fecha actual',
        path: ['fecha_hasta'],
      })
      .optional(),
    eventoId: z
      .number()
      .positive('El ID del evento debe ser un número positivo')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.fecha_hasta && data.fecha_desde) {
        return data.fecha_hasta > data.fecha_desde;
      }
      return true;
    },
    {
      message: 'La fecha hasta debe ser posterior a la fecha desde',
      path: ['fecha_hasta'],
    },
  );

export const createManyRecurrenciaEventoSchema = z.object({
  recurrencias: z
    .array(createRecurrenciaEventoSchema)
    .min(1, 'Debe haber al menos una recurrencia'),
});
