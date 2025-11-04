import {
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
  HasMany,
} from 'sequelize-typescript';
import { Evento } from '@/evento/model';
import {
  EstadoInstanciaEvento,
  HEstadoInstanciaEvento,
} from '@/estado-instancia-evento/model';
import { RecurrenciaEvento } from '@/evento/model';
import { Reserva } from '@/reserva/model';

export interface InstanciaEventoAttributes {
  id: number;
  fecha: Date;
  eventoId: number;
  recurrenciaEventoId?: number;
  estadoId?: number;

  evento?: Evento;
  recurrenciaEvento?: RecurrenciaEvento;
  estado?: EstadoInstanciaEvento;
  historialEstados?: HEstadoInstanciaEvento[];
}

export type InstanciaEventoCreationAttributes = Omit<
  InstanciaEventoAttributes,
  'id' | 'evento' | 'recurrenciaEvento' | 'estado' | 'historialEstados'
>;

@Table({
  tableName: 'instancias_evento',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class InstanciaEvento extends Model<
  InstanciaEventoAttributes,
  InstanciaEventoCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.DATE, allowNull: false })
  fecha!: Date;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  eventoId!: number;

  @BelongsTo(() => Evento)
  evento?: Evento;

  @ForeignKey(() => RecurrenciaEvento)
  @Column({ type: DataType.INTEGER, allowNull: true })
  recurrenciaEventoId?: number;

  @BelongsTo(() => RecurrenciaEvento)
  recurrenciaEvento?: RecurrenciaEvento;

  @ForeignKey(() => EstadoInstanciaEvento)
  @Column({ type: DataType.INTEGER, allowNull: true })
  estadoId?: number;

  @BelongsTo(() => EstadoInstanciaEvento)
  estado?: EstadoInstanciaEvento;

  @HasMany(() => HEstadoInstanciaEvento)
  historialEstados?: HEstadoInstanciaEvento[];

  @HasMany(() => Reserva)
  reservas?: Reserva[];
}
