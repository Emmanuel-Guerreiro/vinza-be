import { z } from 'zod';
import { DiaSemana, HoraEvento } from './model';

// Función para convertir string a Date - VERSION NUEVA
const stringToDate = (val: string): Date => {
  console.log('Convirtiendo fecha:', val, typeof val);
  const date = new Date(val);
  if (isNaN(date.getTime())) {
    throw new Error('Fecha inválida');
  }
  return date;
};

export const createRecurrenciaEventoSchema = z.object({
  dia: z.nativeEnum(DiaSemana, {
    required_error: 'El día es requerido',
    invalid_type_error: 'El día debe ser un día válido de la semana',
  }),
  hora: z.nativeEnum(HoraEvento, {
    required_error: 'La hora es requerida',
    invalid_type_error: 'La hora debe ser una hora válida',
  }),
  fecha_desde: z.string().transform(stringToDate).refine((date) => date > new Date(), {
    message: 'La fecha desde debe ser posterior a la fecha actual',
    path: ['fecha_desde'],
  }),
  fecha_hasta: z.string().transform(stringToDate).refine((date) => date > new Date(), {
    message: 'La fecha hasta debe ser posterior a la fecha actual',
    path: ['fecha_hasta'],
  }),
  eventoId: z.number().positive('El ID del evento debe ser un número positivo'),
}).refine((data) => data.fecha_hasta > data.fecha_desde, {
  message: 'La fecha hasta debe ser posterior a la fecha desde',
  path: ['fecha_hasta'],
});

export const updateRecurrenciaEventoSchema = z.object({
  dia: z.nativeEnum(DiaSemana, {
    invalid_type_error: 'El día debe ser un día válido de la semana',
  }).optional(),
  hora: z.nativeEnum(HoraEvento, {
    invalid_type_error: 'La hora debe ser una hora válida',
  }).optional(),
  fecha_desde: z.string().transform(stringToDate).refine((date) => date > new Date(), {
    message: 'La fecha desde debe ser posterior a la fecha actual',
    path: ['fecha_desde'],
  }).optional(),
  fecha_hasta: z.string().transform(stringToDate).refine((date) => date > new Date(), {
    message: 'La fecha hasta debe ser posterior a la fecha actual',
    path: ['fecha_hasta'],
  }).optional(),
  eventoId: z.number().positive('El ID del evento debe ser un número positivo').optional(),
}).refine((data) => {
  if (data.fecha_hasta && data.fecha_desde) {
    return data.fecha_hasta > data.fecha_desde;
  }
  return true;
}, {
  message: 'La fecha hasta debe ser posterior a la fecha desde',
  path: ['fecha_hasta'],
});

