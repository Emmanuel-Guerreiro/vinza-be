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
import { Valoracion, ValoracionMedia } from '@/valoracion/model';
import { MaximosDiasAdelanteReserva } from '@/maximos-dias-adelante-reserva/model';
import { RecurrenciaEvento } from '@/evento/model';
import { InstanciaEvento } from '@/instancia-evento/model';
import { EstadoReserva, HEstadoReserva } from '@/estado-reserva/model';
import {
  HEstadoInstanciaEvento,
  EstadoInstanciaEvento,
} from '@/estado-instancia-evento/model';
import { Recorrido } from '@/recorrido/model';
import { Reserva } from '@/reserva/model';
import { EstadoRecorrido, HEstadoRecorrido } from '@/estado-recorrido/model';

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
    ValoracionMedia,
    CodigoRecuperarContra,
    MaximosDiasAdelanteReserva,
    RecurrenciaEvento,
    InstanciaEvento,
    EstadoInstanciaEvento,
    HEstadoInstanciaEvento,
    EstadoReserva,
    HEstadoReserva,
    Reserva,
    Recorrido,
    EstadoRecorrido,
    HEstadoRecorrido,
  ], // or [Player, Team],
});

logger.info('Initialized db models');

export type db = typeof sequelize;
