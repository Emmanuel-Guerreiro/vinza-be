import { Evento } from '@/evento/model';
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
import { EstadoEventoEnum } from './enum';

export interface EstadoEventoAttributes {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type EstadoEventoCreationAttributes = Omit<
  EstadoEventoAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

@Table({
  tableName: 'estado_eventos',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class EstadoEvento extends Model<
  EstadoEventoAttributes,
  EstadoEventoCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.ENUM(...Object.values(EstadoEventoEnum)),
    allowNull: false,
  })
  nombre!: EstadoEventoEnum;

  @CreatedAt
  @Column({ type: DataType.DATE })
  created_at!: string;

  @UpdatedAt
  @Column({ type: DataType.DATE })
  updated_at!: string;

  @DeletedAt
  @Column({ type: DataType.DATE })
  deleted_at!: string | null;

  @BelongsToMany(() => Evento, () => HEstadoEvento)
  eventos!: Evento[];
}

export interface HEstadoEventoAttributes {
  id: number;
  eventoId: number;
  estadoEventoId: number;
  created_at: Date;
  deleted_at: Date | null;
}

export type HEstadoEventoCreationAttributes = Omit<
  HEstadoEventoAttributes,
  'id' | 'created_at' | 'deleted_at'
>;

@Table({
  paranoid: true,
  createdAt: 'created_at',
  deletedAt: 'deleted_at',
  updatedAt: false,
  tableName: 'h_estado_eventos',
})
export class HEstadoEvento extends Model<
  HEstadoEventoAttributes,
  HEstadoEventoCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  eventoId!: number;

  @ForeignKey(() => EstadoEvento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  estadoEventoId!: number;

  @CreatedAt
  @Column({ type: DataType.DATE })
  created_at!: Date;

  @DeletedAt
  @Column({ type: DataType.DATE })
  deleted_at!: Date | null;
}
