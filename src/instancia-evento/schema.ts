import { paginationAndOrderSchema } from '@/pagination/schemas';
import { z } from 'zod';

// Schema para crear instancia de evento
export const createInstanciaEventoSchema = z.object({
  fecha: z.coerce
    .date({
      required_error: 'La fecha es requerida',
      invalid_type_error: 'La fecha debe ser una fecha válida',
    })
    .refine((date) => date > new Date(), {
      message: 'La fecha debe ser posterior a la fecha actual',
      path: ['fecha'],
    }),
  eventoId: z
    .number({
      required_error: 'El ID del evento es requerido',
      invalid_type_error: 'El ID del evento debe ser un número válido',
    })
    .positive('El ID del evento debe ser un número positivo'),
  recurrenciaEventoId: z
    .number({
      required_error: 'El ID de la recurrencia es requerido',
      invalid_type_error: 'El ID de la recurrencia debe ser un número válido',
    })
    .positive('El ID de la recurrencia debe ser un número positivo'),
  estadoId: z
    .number()
    .positive('El ID del estado debe ser un número positivo')
    .optional(),
});

// Schema para actualizar instancia de evento
export const updateInstanciaEventoSchema = z.object({
  fecha: z.coerce
    .date({
      invalid_type_error: 'La fecha debe ser una fecha válida',
    })
    .refine((date) => date > new Date(), {
      message: 'La fecha debe ser posterior a la fecha actual',
      path: ['fecha'],
    })
    .optional(),
  eventoId: z
    .number({
      invalid_type_error: 'El ID del evento debe ser un número válido',
    })
    .positive('El ID del evento debe ser un número positivo')
    .optional(),
  recurrenciaEventoId: z
    .number({
      invalid_type_error: 'El ID de la recurrencia debe ser un número válido',
    })
    .positive('El ID de la recurrencia debe ser un número positivo')
    .optional(),
  estadoId: z
    .number()
    .positive('El ID del estado debe ser un número positivo')
    .optional(),
});

// Valid attributes from the InstanciaEvento model for ordering
const instanciaEventoOrderByAttributes = [
  'id',
  'fecha',
  'eventoId',
  'recurrenciaEventoId',
  'estadoId',
  'created_at',
  'updated_at',
  'deleted_at',
];

export const findAllParamsSchema = paginationAndOrderSchema(
  instanciaEventoOrderByAttributes,
)
  .extend({
    eventoId: z.coerce
      .number()
      .positive('El ID del evento debe ser un número positivo')
      .optional(),
    recurrenciaEventoId: z.coerce
      .number()
      .positive('El ID de la recurrencia debe ser un número positivo')
      .optional(),
    estadoId: z.coerce
      .number()
      .positive('El ID del estado debe ser un número positivo')
      .optional(),
    fechaDesde: z.coerce
      .date({
        invalid_type_error: 'La fecha desde debe ser una fecha válida',
      })
      .optional(),
    fechaHasta: z.coerce
      .date({
        invalid_type_error: 'La fecha hasta debe ser una fecha válida',
      })
      .optional(),
    // Filtros adicionales útiles para instancias de eventos
    nombreEvento: z.string().optional(),
    categoriaEventoId: z.coerce
      .number()
      .positive('El ID de la categoría debe ser un número positivo')
      .optional(),
    sucursalId: z.coerce
      .number()
      .positive('El ID de la sucursal debe ser un número positivo')
      .optional(),
    precioMaximo: z.coerce
      .number()
      .min(0, 'El precio máximo debe ser un número mayor o igual a 0')
      .optional(),
    precioMinimo: z.coerce
      .number()
      .min(0, 'El precio mínimo debe ser un número mayor o igual a 0')
      .optional(),
  })
  .refine(
    (data) => {
      // Validar que si se proporcionan ambas fechas, fechaDesde sea anterior a fechaHasta
      if (
        data.fechaDesde &&
        data.fechaHasta &&
        data.fechaDesde >= data.fechaHasta
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'La fecha desde debe ser anterior a la fecha hasta',
      path: ['fechaHasta'],
    },
  );
