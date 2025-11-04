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

export interface CategoriaEventoAttributes {
  id: number;
  nombre: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  eventos?: Evento[];
}

export type CategoriaEventoCreationAttributes = Omit<
  CategoriaEventoAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'eventos'
>;

@Table({
  tableName: 'categoria_eventos',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class CategoriaEvento extends Model<
  CategoriaEventoAttributes,
  CategoriaEventoCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  nombre!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  descripcion!: string;

  @CreatedAt
  @Column({ type: DataType.DATE })
  created_at!: string;

  @UpdatedAt
  @Column({ type: DataType.DATE })
  updated_at!: string;

  @DeletedAt
  @Column({ type: DataType.DATE })
  deleted_at!: string | null;

  @BelongsToMany(() => Evento, () => HCategoriaEvento)
  eventos!: Evento[];
}

export interface HCategoriaEventoAttributes {
  id: number;
  eventoId: number;
  categoriaEventoId: number;
  created_at: Date;
  deleted_at: Date | null;
}

export type HCategoriaEventoCreationAttributes = Omit<
  HCategoriaEventoAttributes,
  'id' | 'created_at' | 'deleted_at'
>;

@Table({
  tableName: 'h_categoria_eventos',
  paranoid: true,
  createdAt: 'created_at',
  deletedAt: 'deleted_at',
  updatedAt: false,
})
export class HCategoriaEvento extends Model<
  HCategoriaEventoAttributes,
  HCategoriaEventoCreationAttributes
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

  @ForeignKey(() => CategoriaEvento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  categoriaEventoId!: number;

  @CreatedAt
  @Column({ type: DataType.DATE })
  created_at!: Date;

  @DeletedAt
  @Column({ type: DataType.DATE })
  deleted_at!: Date | null;
}
