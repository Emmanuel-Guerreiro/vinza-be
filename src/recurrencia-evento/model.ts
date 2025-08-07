import {
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
} from 'sequelize-typescript';
import { Evento } from '@/evento/model';

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

export interface RecurrenciaEventoAttributes {
  id: number;
  dia: DiaSemana;
  hora: HoraEvento;
  fecha_desde: Date;
  fecha_hasta: Date;
  eventoId: number;
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
    allowNull: false 
  })
  dia!: DiaSemana;

  @Column({ 
    type: DataType.ENUM(...Object.values(HoraEvento)), 
    allowNull: false 
  })
  hora!: HoraEvento;

  @Column({ type: DataType.DATE, allowNull: false })
  fecha_desde!: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  fecha_hasta!: Date;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  eventoId!: number;

  @BelongsTo(() => Evento)
  evento?: Evento;
}

