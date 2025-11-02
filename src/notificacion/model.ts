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

export interface TipoNotificacionAttributes {
  id: number;
  nombre: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export type TipoNotificacionCreationAttributes = Omit<
  TipoNotificacionAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

@Table({
  tableName: 'tipo_notificaciones',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class TipoNotificacion extends Model<
  TipoNotificacionAttributes,
  TipoNotificacionCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  nombre!: string;

  @HasMany(() => Notificacion)
  notificaciones!: Notificacion[];
}

export interface NotificacionAttributes {
  id: number;
  titulo: string;
  descripcion: string;
  userId: number;
  tipoNotificacionId: number;
  reservaId: number;
  user?: User;
  tipoNotificacion?: TipoNotificacion;
  reserva?: Reserva;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export type NotificacionCreationAttributes = Omit<
  NotificacionAttributes,
  | 'id'
  | 'user'
  | 'tipoNotificacion'
  | 'reserva'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
>;

@Table({
  tableName: 'notificaciones',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class Notificacion extends Model<
  NotificacionAttributes,
  NotificacionCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  titulo!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  descripcion!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId!: number;

  @BelongsTo(() => User)
  user?: User;

  @ForeignKey(() => TipoNotificacion)
  @Column({ type: DataType.INTEGER, allowNull: false })
  tipoNotificacionId!: number;

  @BelongsTo(() => TipoNotificacion)
  tipoNotificacion?: TipoNotificacion;

  @ForeignKey(() => Reserva)
  @Column({ type: DataType.INTEGER, allowNull: false })
  reservaId!: number;

  @BelongsTo(() => Reserva)
  reserva?: Reserva;
}
