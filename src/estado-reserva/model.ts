import { Reserva } from '@/reserva/model';
import {
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
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

  @Column({ type: DataType.STRING, allowNull: false })
  nombre!: string;

  @CreatedAt
  @Column({ type: DataType.DATE })
  created_at!: string;

  @UpdatedAt
  @Column({ type: DataType.DATE })
  updated_at!: string;

  @DeletedAt
  @Column({ type: DataType.DATE })
  deleted_at!: string | null;

  @BelongsToMany(() => Reserva, () => HEstadoReserva)
  reservas!: Reserva[];
}

export interface HEstadoReservaAttributes {
  id: number;
  reservaId: number;
  estadoReservaId: number;
  created_at: Date;
  deleted_at: Date | null;
}

export type HEstadoReservaCreationAttributes = Omit<
  HEstadoReservaAttributes,
  'id' | 'created_at' | 'deleted_at'
>;

@Table({
  paranoid: true,
  createdAt: 'created_at',
  deletedAt: 'deleted_at',
  updatedAt: false,
  tableName: 'h_estado_reservas',
})
export class HEstadoReserva extends Model<
  HEstadoReservaAttributes,
  HEstadoReservaCreationAttributes
> {
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

  @CreatedAt
  @Column({ type: DataType.DATE })
  created_at!: Date;

  @DeletedAt
  @Column({ type: DataType.DATE })
  deleted_at!: Date | null;
}
