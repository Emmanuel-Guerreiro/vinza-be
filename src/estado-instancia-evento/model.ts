import { InstanciaEvento } from '@/InstanciaEvento/model';
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

export interface EstadoInstanciaEventoAttributes {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type EstadoInstanciaaEventoCreationAttributes = Omit<
EstadoInstanciaEventoAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

@Table({
  tableName: 'estado_instancia_eventos',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class EstadoInstanciaEvento extends Model<
  EstadoInstanciaEventoAttributes,
  EstadoInstanciaaEventoCreationAttributes
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

  @BelongsToMany(() => InstanciaEvento, () => HEstadoInstanciaEvento)
  eventos!: InstanciaEvento[];
}

export interface HEstadoInstanciaEventoAttributes {
  id: number;
  instanciaeventoId: number;
  estadoInstanciaEventoId: number;
  created_at: Date;
  deleted_at: Date | null;
}

export type HEstadoInstanciaEventoCreationAttributes = Omit<
  HEstadoInstanciaEventoAttributes,
  'id' | 'created_at' | 'deleted_at'
>;

@Table({
  paranoid: true,
  createdAt: 'created_at',
  deletedAt: 'deleted_at',
  updatedAt: false,
  tableName: 'h_estado_instancia_eventos',
})
export class HEstadoInstanciaEvento extends Model<
  HEstadoInstanciaEventoAttributes,
  HEstadoInstanciaEventoCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => InstanciaEvento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  instanciaeventoId!: number;

  @ForeignKey(() => EstadoInstanciaEvento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  estadoInstanciaEventoId!: number;

  @CreatedAt
  @Column({ type: DataType.DATE })
  created_at!: Date;

  @DeletedAt
  @Column({ type: DataType.DATE })
  deleted_at!: Date | null;
}