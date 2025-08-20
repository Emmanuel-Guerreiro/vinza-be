import {
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '@/users/model';
import { Evento } from '@/evento/model';

export interface ValoracionAttributes {
  id: number;
  valor: number;
  comentario: string;
  created_at: string;
  deleted_at?: string;
  userId: number;
  eventoId: number;
}

export type ValoracionCreationAttributes = Omit<
  ValoracionAttributes,
  'id' | 'created_at' | 'deleted_at'
>;

@Table({
  tableName: 'valoraciones',
  paranoid: true,
  createdAt: 'created_at',
  deletedAt: 'deleted_at',
  updatedAt: 'updated_at',
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
