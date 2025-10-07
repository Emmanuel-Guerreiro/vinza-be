import { User } from '@/users/model';
import { Reserva } from '@/reserva/model';
import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { EstadoRecorrido, HEstadoRecorrido } from '@/estado-recorrido/model';

export interface RecorridoAttributes {
  created_at: Date;
  deleted_at: Date | null;
  last_optimization: Date | null;
  userId: number;
  id: number;
  reservas: Reserva[];
  estados: EstadoRecorrido[];
}

export type RecorridoCreationAttributes = Omit<
  RecorridoAttributes,
  | 'created_at'
  | 'deleted_at'
  | 'last_optimization'
  | 'id'
  | 'reservas'
  | 'estados'
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
  deleted_at!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  last_optimization!: Date;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId!: number;

  @BelongsTo(() => User)
  user?: User;

  @HasMany(() => Reserva)
  reservas!: Reserva[];

  @BelongsToMany(() => EstadoRecorrido, () => HEstadoRecorrido)
  estados!: EstadoRecorrido[];
}
