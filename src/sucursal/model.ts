import {
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
} from 'sequelize-typescript';
import { Bodega } from '@/bodega/model';

export interface SucursalAttributes {
  id: number;
  nombre: string;
  es_principal: boolean;
  direccion: string;
  aclaraciones?: string;
  bodegaId: number;
}

export type SucursalCreationAttributes = Omit<SucursalAttributes, 'id'>;

@Table({
  tableName: 'sucursales',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class Sucursal extends Model<
  SucursalAttributes,
  SucursalCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  nombre!: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  es_principal!: boolean;

  @Column({ type: DataType.STRING, allowNull: false })
  direccion!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  aclaraciones?: string;

  @ForeignKey(() => Bodega)
  @Column({ type: DataType.INTEGER, allowNull: false })
  bodegaId!: number;

  @BelongsTo(() => Bodega)
  bodega?: Bodega;
}
