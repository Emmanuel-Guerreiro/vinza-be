import { Recorrido } from '../recorrido/model';
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

export interface EstadoRecorridoAttributes {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type EstadoRecorridoCreationAttributes = Omit<
  EstadoRecorridoAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;
@Table({
  tableName: 'estado_recorridos',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class EstadoRecorrido extends Model<
  EstadoRecorridoAttributes,
  EstadoRecorridoCreationAttributes
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

  @BelongsToMany(() => Recorrido, () => HEstadoRecorrido)
  recorridos!: Recorrido[];
}

export interface HEstadoRecorridoAttributes {
  id: number;
  recorridoId: number;
  estadoRecorridoId: number;
  created_at: Date;
  deleted_at: Date | null;
}
export type HEstadoRecorridoCreationAttributes = Omit<
  HEstadoRecorridoAttributes,
  'id' | 'created_at' | 'deleted_at'
>;
@Table({
  paranoid: true,
  createdAt: 'created_at',
  deletedAt: 'deleted_at',
  updatedAt: false,
  tableName: 'h_estado_recorridos',
})
export class HEstadoRecorrido extends Model<
  HEstadoRecorridoAttributes,
  HEstadoRecorridoCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;
  @ForeignKey(() => Recorrido)
  @Column({ type: DataType.INTEGER, allowNull: false })
  recorridoId!: number;

  @ForeignKey(() => EstadoRecorrido)
  @Column({ type: DataType.INTEGER, allowNull: false })
  estadoRecorridoId!: number;

  @CreatedAt
  @Column({ type: DataType.DATE })
  created_at!: Date;

  @DeletedAt
  @Column({ type: DataType.DATE })
  deleted_at!: Date | null;
}
