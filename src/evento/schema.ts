import { paginationAndOrderSchema } from '@/pagination/schemas';
import { z } from 'zod';
import { DiaSemana, HoraEvento } from './model';

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
        invalid_type_error: 'La fecha desde debe ser una fecha válida',
      })
      .optional()
      .transform((date) => {
        // Si no se proporciona fecha o es anterior a hoy, usar fecha actual
        const fechaActual = new Date();
        if (!date || date < fechaActual) {
          return fechaActual;
        }
        return date;
      }),
    fecha_hasta: z.coerce
      .date({
        invalid_type_error: 'La fecha hasta debe ser una fecha válida',
      })
      .optional()
      .nullable()
      .transform((date) => {
        // Si no se proporciona fecha, mantener como null (tiempo ilimitado)
        return date || null;
      }),
  })
  .refine(
    (data) => {
      // Solo validar si ambas fechas están presentes y no son null
      if (data.fecha_desde && data.fecha_hasta) {
        return data.fecha_hasta >= data.fecha_desde;
      }
      return true;
    },
    {
      message: 'La fecha hasta debe ser igual o posterior a la fecha desde',
      path: ['fecha_hasta'],
    },
  );

export const createEventoSchema = z.object({
  nombre: z.string().min(1, 'El nombre no puede estar vacío'),
  descripcion: z.string().min(1, 'La descripción no puede estar vacía'),
  cupo: z.coerce.number().positive('El cupo debe ser un número mayor a 0'),
  sucursalId: z.coerce.number(),
  estadoId: z.coerce.number().optional(),
  categoriaId: z.coerce.number().optional(),
  precio: z.coerce.number().positive('El precio debe ser un número mayor a 0'),
  recurrencias: z
    .array(recurrenciaSchema)
    .min(1, 'Debe proporcionar al menos una recurrencia para el evento'),
});

export const createEventoWithMultimediaSchema = createEventoSchema.extend({
  multimediaPortada: z.string().optional(), // If present, will match the name of the file to make it portada
});

export const updateEventoSchema = z.object({
  nombre: z.string().min(1, 'El nombre no puede estar vacío').optional(),
  descripcion: z
    .string()
    .min(1, 'La descripción no puede estar vacía')
    .optional(),
  cupo: z.coerce
    .number()
    .positive('El cupo debe ser un número mayor a 0')
    .optional(),
  sucursalId: z.coerce.number().optional(),
  estadoId: z.coerce.number().optional(),
  categoriaId: z.coerce.number().optional(),
  precio: z.coerce
    .number()
    .positive('El precio debe ser un número mayor a 0')
    .optional(),
  recurrencias: z
    .array(recurrenciaSchema)
    .min(1, 'Debe proporcionar al menos una recurrencia para el evento')
    .optional(),
  removeMultimedia: z.array(z.number()).optional(),
  multimediaPortada: z.string().optional(),
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
  precioMinimo: z.coerce.number().min(0).optional(),
  precioMaximo: z.coerce.number().min(0).optional(),
  puntuacionMinima: z.coerce.number().min(0).max(5).optional(),
  nombre: z.string().optional(),
});
