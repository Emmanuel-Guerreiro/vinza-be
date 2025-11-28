import { User } from '@/users/model';
import { Evento } from '@/evento/model';
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  BelongsTo,
} from 'sequelize-typescript';

export interface NotificacionDescartadaAttributes {
  id: number;
  usuarioId: number;
  eventoId: number;
  created_at: Date;
}

export type NotificacionDescartadaCreationAttributes = Omit<
  NotificacionDescartadaAttributes,
  'id' | 'created_at'
>;

@Table({
  tableName: 'notificaciones_descartadas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['usuarioId', 'eventoId'],
    },
  ],
})
export class NotificacionDescartada extends Model<
  NotificacionDescartadaAttributes,
  NotificacionDescartadaCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  usuarioId!: number;

  @BelongsTo(() => User)
  usuario?: User;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  eventoId!: number;

  @BelongsTo(() => Evento)
  evento?: Evento;

  @Column({ type: DataType.DATE, allowNull: false })
  created_at!: Date;
}
