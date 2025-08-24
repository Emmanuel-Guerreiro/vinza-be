import { User } from '@/users/model';
import { Reserva } from '@/reserva/model';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';

export interface RecorridoAttributes {
  created_at: Date;
  deleted_at: Date | null;
  last_optimization: Date | null;
  userId: number;
}

export type RecorridoCreationAttributes = Omit<
  RecorridoAttributes,
  'created_at' | 'deleted_at' | 'last_optimization'
>;

@Table({
  tableName: 'recorridos',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class Recorrido extends Model<
  RecorridoAttributes,
  RecorridoCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.DATE, allowNull: false })
  created_at!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  deleted_at!: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  last_optimization!: Date | null;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId!: number;

  @BelongsTo(() => User)
  user?: User;

  @HasMany(() => Reserva)
  reservas!: Reserva[];
}
