import { Reserva } from '@/reserva/model';
import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

export interface EstadoReservaAttributes {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type EstadoReservaCreationAttributes = Omit<
  EstadoReservaAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

@Table({
  tableName: 'estado_reservas',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class EstadoReserva extends Model<
  EstadoReservaAttributes,
  EstadoReservaCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  nombre!: string;

  @BelongsToMany(() => Reserva, () => HEstadoReserva)
  reservas!: Reserva[];
}

@Table({
  tableName: 'h_estado_reservas',
  paranoid: true,
  createdAt: 'created_at',
  deletedAt: 'deleted_at',
})
export class HEstadoReserva extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Reserva)
  @Column({ type: DataType.INTEGER, allowNull: false })
  reservaId!: number;

  @ForeignKey(() => EstadoReserva)
  @Column({ type: DataType.INTEGER, allowNull: false })
  estadoReservaId!: number;
}
