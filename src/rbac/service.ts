import { errors } from '@/error';
import { Rol, Permiso } from './model';
import {
  CreatePermissionDto,
  CreateRolDto,
  UpdatePermissionDto,
  UpdateRoleDto,
} from './types';
import { sequelize } from '@/db';
import { Op } from 'sequelize';
import { usersService } from '@/users/service';
import { HRolUsuario } from '@/users/model';

export class RolesService {
  public async create(dto: CreateRolDto) {
    const transaction = await sequelize.transaction();
    try {
      const { permisos, ...rest } = dto;
      let role = await Rol.create(rest, { transaction });

      if (permisos && permisos.length > 0) {
        // Validate that all provided permissions exist
        const foundPermisos = await Permiso.findAll({
          where: { id: permisos },
          transaction,
        });

        if (foundPermisos.length !== permisos.length) {
          throw errors.app.user.permission_not_found;
        }

        await role.$set('permisos', permisos, { transaction });
        role = await role.save({ transaction, returning: true });
      }

      await transaction.commit();
      return role;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async findAll() {
    const roles = await Rol.findAll({
      include: [{ model: Permiso, as: 'permisos' }],
    });
    return roles;
  }

  public async findByUserBodega(userBodegaId: number | null) {
    let whereClause: Record<string, unknown>;

    if (userBodegaId !== null) {
      // Usuario tiene bodega específica: mostrar roles de su bodega + roles globales
      whereClause = {
        [Op.or]: [
          { bodegaId: userBodegaId }, // Roles específicos de su bodega
          { bodegaId: null }, // Roles globales del sistema
        ],
      };
    } else {
      // Usuario sin bodega: solo roles globales
      whereClause = {
        bodegaId: null,
      };
    }

    const roles = await Rol.findAll({
      where: whereClause,
      include: [{ model: Permiso, as: 'permisos' }],
    });
    return roles;
  }

  public async findOne(id: number) {
    const role = await Rol.findByPk(id, {
      include: [{ model: Permiso, as: 'permisos' }],
    });
    return role;
  }

  public async update(id: number, dto: UpdateRoleDto) {
    const transaction = await sequelize.transaction();
    try {
      if ('bodegaId' in dto) {
        // Do not allow updating bodegaId after creation
        delete dto.bodegaId;
      }

      const { permisos, ...rest } = dto;

      // Find the role first
      const role = await Rol.findByPk(id, {
        include: [{ model: Permiso, as: 'permisos' }],
        transaction,
      });

      if (!role) {
        throw errors.app.user.roles_not_found;
      }

      // If permissions are provided, update them
      if (permisos && permisos.length > 0) {
        // Validate that all provided permissions exist
        const foundPermisos = await Permiso.findAll({
          where: { id: permisos },
          transaction,
        });

        if (foundPermisos.length !== permisos.length) {
          throw errors.app.user.permission_not_found;
        }

        // Replace current permissions with new ones
        await role.$set('permisos', permisos, { transaction });
        delete dto.permisos;
      }

      // Update other role properties
      const r = await role.update(rest, {
        transaction,
        returning: true,
      });

      await transaction.commit();
      return r;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async delete(id: number) {
    const role = await Rol.findByPk(id);
    if (!role) throw errors.app.user.roles_not_found;

    const usersWithRole = await HRolUsuario.count({
      where: { rolId: id },
    });

    if (usersWithRole > 0) {
      throw errors.app.user.role_has_users;
    }

    return Rol.destroy({ where: { id } });
  }

  public async canDelete(id: number) {
    const role = await Rol.findByPk(id);
    if (!role) throw errors.app.user.roles_not_found;

    const usersWithRole = await HRolUsuario.count({
      where: { rolId: id },
    });

    return usersWithRole === 0;
  }
}

export class PermissionsService {
  public async update(id: number, dto: UpdatePermissionDto) {
    const permission = await Permiso.update(dto, { where: { id } });
    return permission;
  }

  public async findAll() {
    const permissions = await Permiso.findAll();
    return permissions;
  }

  public async create(dto: CreatePermissionDto) {
    const permission = await Permiso.create(dto);
    return permission;
  }

  public async findMyPermissions(userId: number) {
    const user = await usersService.findOne(userId);
    return user?.roles
      .flatMap((role) => role.permisos.map((permiso) => permiso.clave))
      .reduce((acc, permiso) => ({ ...acc, [permiso]: permiso }), {});
  }
}

export const permissionsService = new PermissionsService();

export type IPermissionsService = typeof permissionsService;

export const rolesService = new RolesService();

export type IRolesService = typeof rolesService;
