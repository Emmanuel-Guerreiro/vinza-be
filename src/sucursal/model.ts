import { Bodega } from '@/bodega/model';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

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

  @Column({
    type: DataType.DECIMAL(10, 7), // precise to ~1cm
    comment: 'Latitude in decimal degrees (-90 to 90)',
    allowNull: false,
  })
  latitude!: number;

  @Column({
    type: DataType.DECIMAL(10, 7), // precise to ~1cm
    comment: 'Longitude in decimal degrees (-180 to 180)',
    allowNull: false,
  })
  longitude!: number;

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
