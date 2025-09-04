import {
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { User } from '@/users/model';
import { Evento } from '@/evento/model';

export interface ValoracionAttributes {
  id: number;
  valor: number;
  comentario: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  userId: number;
  eventoId: number;
}

export type ValoracionCreationAttributes = Omit<
  ValoracionAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

@Table({
  tableName: 'valoraciones',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class Valoracion extends Model<
  ValoracionAttributes,
  ValoracionCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  valor!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  comentario!: string;

  @CreatedAt
  @Column({ type: DataType.DATE })
  created_at!: string;

  @UpdatedAt
  @Column({ type: DataType.DATE })
  updated_at!: string;

  @DeletedAt
  @Column({ type: DataType.DATE })
  deleted_at?: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId!: number;

  @BelongsTo(() => User)
  user?: User;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  eventoId!: number;

  @BelongsTo(() => Evento)
  evento?: Evento;
}

export interface ValoracionMediaAttributes {
  id: number;
  valor_medio: number;
  cantidad_valoraciones: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  eventoId: number;
}

export type ValoracionMediaCreationAttributes = Omit<
  ValoracionMediaAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

@Table({
  tableName: 'valoracion_media',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class ValoracionMedia extends Model<
  ValoracionMediaAttributes,
  ValoracionMediaCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Average rating value for the event',
  })
  valor_medio!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Total number of ratings for this event',
  })
  cantidad_valoraciones!: number;

  @CreatedAt
  @Column({ type: DataType.DATE })
  created_at!: string;

  @UpdatedAt
  @Column({ type: DataType.DATE })
  updated_at!: string;

  @DeletedAt
  @Column({ type: DataType.DATE })
  deleted_at?: string;

  @ForeignKey(() => Evento)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
  })
  eventoId!: number;

  @BelongsTo(() => Evento)
  evento?: Evento;
}
