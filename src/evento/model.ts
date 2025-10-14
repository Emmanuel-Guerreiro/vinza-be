import {
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
  HasMany,
} from 'sequelize-typescript';
import { Sucursal } from '@/sucursal/model';
import { EstadoEvento } from '@/estado-evento/model';
import { CategoriaEvento } from '@/categoria-evento/model';

import { Valoracion, ValoracionMedia } from '@/valoracion/model';
import { InstanciaEvento } from '@/instancia-evento/model';
import { MultimediaEventos } from '@/multimedia/model';

// Enums para recurrencia de eventos
export enum DiaSemana {
  LUNES = 'Lunes',
  MARTES = 'Martes',
  MIERCOLES = 'Miércoles',
  JUEVES = 'Jueves',
  VIERNES = 'Viernes',
  SABADO = 'Sábado',
  DOMINGO = 'Domingo',
}

export enum HoraEvento {
  HORA_08_00 = '08:00',
  HORA_08_30 = '08:30',
  HORA_09_00 = '09:00',
  HORA_09_30 = '09:30',
  HORA_10_00 = '10:00',
  HORA_10_30 = '10:30',
  HORA_11_00 = '11:00',
  HORA_11_30 = '11:30',
  HORA_12_00 = '12:00',
  HORA_12_30 = '12:30',
  HORA_13_00 = '13:00',
  HORA_13_30 = '13:30',
  HORA_14_00 = '14:00',
  HORA_14_30 = '14:30',
  HORA_15_00 = '15:00',
  HORA_15_30 = '15:30',
  HORA_16_00 = '16:00',
  HORA_16_30 = '16:30',
  HORA_17_00 = '17:00',
  HORA_17_30 = '17:30',
  HORA_18_00 = '18:00',
  HORA_18_30 = '18:30',
  HORA_19_00 = '19:00',
  HORA_19_30 = '19:30',
  HORA_20_00 = '20:00',
  HORA_20_30 = '20:30',
  HORA_21_00 = '21:00',
  HORA_21_30 = '21:30',
  HORA_22_00 = '22:00',
  HORA_22_30 = '22:30',
  HORA_23_00 = '23:00',
  HORA_23_30 = '23:30',
}

export interface EventoAttributes {
  id: number;
  nombre: string;
  descripcion: string;
  cupo: number;
  precio: number;
  sucursalId: number;
  estadoId?: number;
  categoriaId?: number;
  recurrencias?: RecurrenciaEvento[];
  instancias?: InstanciaEvento[];
  valoracionMedia?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type EventoCreationAttributes = Omit<
  EventoAttributes,
  | 'id'
  | 'recurrencias'
  | 'valoracionMedia'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
>;

@Table({
  tableName: 'eventos',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class Evento extends Model<EventoAttributes, EventoCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  nombre!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  descripcion!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  cupo!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precio!: number;

  @ForeignKey(() => Sucursal)
  @Column({ type: DataType.INTEGER, allowNull: false })
  sucursalId!: number;

  @BelongsTo(() => Sucursal)
  sucursal?: Sucursal;

  @ForeignKey(() => EstadoEvento)
  @Column({ type: DataType.INTEGER, allowNull: true })
  estadoId?: number;

  @BelongsTo(() => EstadoEvento)
  estado?: EstadoEvento;

  @ForeignKey(() => CategoriaEvento)
  @Column({ type: DataType.INTEGER, allowNull: true })
  categoriaId?: number;

  @BelongsTo(() => CategoriaEvento)
  categoria?: CategoriaEvento;

  @HasMany(() => RecurrenciaEvento, { onDelete: 'CASCADE' })
  recurrencias?: RecurrenciaEvento[];

  @HasMany(() => Valoracion, { onDelete: 'CASCADE' })
  valoraciones?: Valoracion[];

  @HasMany(() => MultimediaEventos, { onDelete: 'CASCADE' })
  multimedia?: MultimediaEventos[];

  @HasMany(() => ValoracionMedia, { onDelete: 'CASCADE' })
  valoracionMedia?: ValoracionMedia[];

  @HasMany(() => InstanciaEvento, { onDelete: 'CASCADE' })
  instancias?: InstanciaEvento[];
}

// Interfaces para RecurrenciaEvento
export interface RecurrenciaEventoAttributes {
  id: number;
  dia: DiaSemana;
  hora: HoraEvento;
  fecha_desde: Date | null;
  fecha_hasta: Date | null;
  eventoId: number;
  instancias?: InstanciaEvento[];
}

export type RecurrenciaEventoCreationAttributes = Omit<
  RecurrenciaEventoAttributes,
  'id'
>;

@Table({
  tableName: 'recurrencias_evento',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class RecurrenciaEvento extends Model<
  RecurrenciaEventoAttributes,
  RecurrenciaEventoCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.ENUM(...Object.values(DiaSemana)),
    allowNull: false,
  })
  dia!: DiaSemana;

  @Column({
    type: DataType.ENUM(...Object.values(HoraEvento)),
    allowNull: false,
  })
  hora!: HoraEvento;

  @Column({ type: DataType.DATE, allowNull: true })
  fecha_desde!: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  fecha_hasta!: Date | null;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  eventoId!: number;

  @BelongsTo(() => Evento)
  evento?: Evento;

  @HasMany(() => InstanciaEvento)
  instancias?: InstanciaEvento[];
}
