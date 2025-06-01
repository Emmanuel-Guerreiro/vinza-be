import { Rol } from '@/rbac/model';
import { User } from '@/users/model';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';

export interface BodegaAttributes {
  id: number;
  nombre: string;
  descripcion: string;
  roles?: Rol[];
  users?: User[];
}

export type BodegaCreationAttributes = Omit<
  BodegaAttributes,
  'id' | 'roles' | 'users'
>;

@Table({
  tableName: 'bodegas',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class Bodega extends Model<BodegaAttributes, BodegaCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  nombre!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  descripcion!: string;

  @HasMany(() => Rol)
  roles?: Rol[];

  @HasMany(() => User)
  users?: User[];
}
