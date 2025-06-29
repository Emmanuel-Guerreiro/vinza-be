import { Bodega } from '@/bodega/model';
import config from '@/config';
import logger from '@/logger';
import { HRolPermiso, Permiso, Rol } from '@/rbac/model';
import { CodigoRecuperarContra, HRolUsuario, User } from '@/users/model';
import 'dotenv/config';
import { Sequelize } from 'sequelize-typescript';
import { Sucursal } from '@/sucursal/model';
import { Audit } from '@/audit/model';
import { EstadoEvento, HEstadoEvento } from '@/estado-evento/model';
import { Evento } from '@/evento/model';
import { CategoriaEvento } from '@/categoria-evento/model';
import { HCategoriaEvento } from '@/categoria-evento/model';
import { Valoracion } from '@/valoracion/model';
import { MaximosDiasAdelanteReserva } from '@/maximos-dias-adelante-reserva/model';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  host: config.DB_HOST,
  port: Number(config.DB_PORT),
  ssl: false,
  sync: { alter: true },
  logging: false,
  models: [
    User,
    HRolUsuario,
    Rol,
    HRolPermiso,
    Permiso,
    Bodega,
    Sucursal,
    Audit,
    Evento,
    EstadoEvento,
    HEstadoEvento,
    CategoriaEvento,
    HCategoriaEvento,
    Valoracion,
    CodigoRecuperarContra,
    MaximosDiasAdelanteReserva,
  ], // or [Player, Team],
});

logger.info('Initialized db models');

export type db = typeof sequelize;
