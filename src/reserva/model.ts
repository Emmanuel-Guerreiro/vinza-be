import { EstadoReserva, HEstadoReserva } from '@/estado-reserva/model';
import { InstanciaEvento } from '@/instancia-evento/model';
import { Recorrido } from '@/recorrido/model';
import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
export interface ReservaAttributes {
  id: number;
  precio: number;
  cantidadGente: number;
  instanciaEventoId: number;
  recorridoId: number;
  estados?: EstadoReserva[];
  instanciaEvento: InstanciaEvento;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ReservaCreationAttributes = Omit<
  ReservaAttributes,
  'id' | 'instanciaEvento' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;
@Table({
  tableName: 'reservas',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class Reserva extends Model<
  ReservaAttributes,
  ReservaCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precio!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  cantidadGente!: number;

  @ForeignKey(() => InstanciaEvento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  instanciaEventoId!: number;

  @BelongsTo(() => InstanciaEvento)
  instanciaEvento!: InstanciaEvento;

  @ForeignKey(() => Recorrido)
  @Column({ type: DataType.INTEGER, allowNull: false })
  recorridoId!: number;

  @BelongsTo(() => Recorrido)
  recorrido!: Recorrido;

  @BelongsToMany(() => EstadoReserva, () => HEstadoReserva)
  estados!: EstadoReserva[];
}
