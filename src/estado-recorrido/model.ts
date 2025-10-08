import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Recorrido } from '../recorrido/model';

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

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  nombre!: string;

  @BelongsToMany(() => Recorrido, () => HEstadoRecorrido)
  recorridos!: Recorrido[];
}

@Table({
  tableName: 'h_estado_recorridos',
  paranoid: true,
  createdAt: 'created_at',
  deletedAt: 'deleted_at',
  updatedAt: 'updated_at',
})
export class HEstadoRecorrido extends Model {
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
}
