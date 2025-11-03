import z from 'zod';
import {
  createBodegaSchema,
  createBodegaWithMultimediaSchema,
  findAllParamsSchema,
  validateBodegaSchema,
  updateBodegaWithMultimediaSchema,
} from './schema';

export type CreateBodegaDto = z.infer<typeof createBodegaSchema>;

export type CreateBodegaWithMultimediaDto = z.infer<
  typeof createBodegaWithMultimediaSchema
>;

export type UpdateBodegaDto = Partial<CreateBodegaDto>;

export type UpdateBodegaWithMultimediaDto = z.infer<
  typeof updateBodegaWithMultimediaSchema
>;

export type FindAllParams = z.infer<typeof findAllParamsSchema>;

export type ValidateBodegaDto = z.infer<typeof validateBodegaSchema>;

export interface IngresoMensual {
  month: string;
  ingresos: number;
}

export interface EventoPorCategoria {
  categoria: string;
  cantidad: number;
}

export interface OcupacionSemanal {
  dia: string;
  fecha: string;
  reservasConfirmadas: number;
}

export interface BodegaMetrics {
  eventosActivos: number;
  personalActivo: number;
  puntuacionPromedio: number;
  bodegasActivas: number;
  tasaOcupacion: number;
  ingresosMensuales: number;
  historialIngresosMensuales: IngresoMensual[];
  eventosPorCategoria: EventoPorCategoria[];
  ocupacionSemanal: OcupacionSemanal[];
}
