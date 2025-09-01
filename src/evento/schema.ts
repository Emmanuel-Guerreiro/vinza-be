import { paginationAndOrderSchema } from '@/pagination/schemas';
import { z } from 'zod';
import { DiaSemana, HoraEvento } from '@/recurrencia-evento/model';

// Schema para recurrencia individual
const recurrenciaSchema = z
  .object({
    dia: z.nativeEnum(DiaSemana, {
      required_error: 'El día es requerido',
      invalid_type_error: 'El día debe ser un día válido de la semana',
    }),
    hora: z.nativeEnum(HoraEvento, {
      required_error: 'La hora es requerida',
      invalid_type_error: 'La hora debe ser una hora válida',
    }),
    fecha_desde: z.coerce
      .date({
        required_error: 'La fecha desde es requerida',
        invalid_type_error: 'La fecha desde debe ser una fecha válida',
      })
      .refine((date) => date > new Date(), {
        message: 'La fecha desde debe ser posterior a la fecha actual',
        path: ['fecha_desde'],
      }),
    fecha_hasta: z.coerce
      .date({
        required_error: 'La fecha hasta es requerida',
        invalid_type_error: 'La fecha hasta debe ser una fecha válida',
      })
      .refine((date) => date > new Date(), {
        message: 'La fecha hasta debe ser posterior a la fecha actual',
        path: ['fecha_hasta'],
      }),
  })
  .refine((data) => data.fecha_hasta >= data.fecha_desde, {
    message: 'La fecha hasta debe ser igual o posterior a la fecha desde',
    path: ['fecha_hasta'],
  });

export const createEventoSchema = z.object({
  nombre: z.string(),
  descripcion: z.string(),
  cupo: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'El cupo debe ser un número válido mayor a 0',
  }),
  sucursalId: z.number(),
  estadoId: z.number().optional(),
  categoriaId: z.number().optional(),
  precio: z.number().min(0, 'El precio debe ser un número mayor o igual a 0'),
  recurrencias: z.array(recurrenciaSchema).optional(),
});

export const updateEventoSchema = z.object({
  nombre: z.string().optional(),
  descripcion: z.string().optional(),
  cupo: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'El cupo debe ser un número válido mayor a 0',
    })
    .optional(),
  sucursalId: z.number().optional(),
  estadoId: z.number().optional(),
  categoriaId: z.number().optional(),
  precio: z
    .number()
    .min(0, 'El precio debe ser un número mayor o igual a 0')
    .optional(),
  recurrencias: z
    .array(recurrenciaSchema)
    .min(1, 'Debe proporcionar al menos una recurrencia para el evento')
    .optional(),
});

// Valid attributes from the Evento model for ordering
const eventoOrderByAttributes = [
  'id',
  'nombre',
  'precio',
  'descripcion',
  'cupo',
  'sucursalId',
  'created_at',
  'updated_at',
  'deleted_at',
];

export const findAllParamsSchema = paginationAndOrderSchema(
  eventoOrderByAttributes,
).extend({
  sucursalId: z.coerce.number().optional(),
  categoriaId: z.coerce.number().optional(),
  estadoId: z.coerce.number().optional(),
  bodegaId: z.string().optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  precioMaximo: z.coerce.number().min(0).optional(),
  puntuacionMinima: z.coerce.number().min(0).max(5).optional(),
  nombre: z.string().optional(),
});
