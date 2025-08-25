import { hashPassword } from '@/auth/auth';
import { Bodega } from '@/bodega/model';
import { categoriaEventoService } from '@/categoria-evento/service';
import config from '@/config';
import { estadoEventoService } from '@/estado-evento/service';
import { eventoService } from '@/evento/service';
import { maximosDiasAdelanteReservaService } from '@/maximos-dias-adelante-reserva/service';
import { Permissions } from '@/rbac/permissions';
import { permissionsService, rolesService } from '@/rbac/service';
import { DiaSemana, HoraEvento } from '@/recurrencia-evento/model';
import { sucursalService } from '@/sucursal/service';
import { User } from '@/users/model';
import { Valoracion } from '@/valoracion/model';
import { sequelize } from '.';
import { EstadoInstanciaEvento } from '@/estado-instancia-evento/enum';
import { EstadoInstanciaEvento as EstadoInstanciaEventoModel } from '@/estado-instancia-evento/model';
// import { estadoReservaService } from '@/estado-reserva/service'; // Comentado temporalmente
// import { EstadoReserva } from '@/estado-reserva/enum'; // Comentado temporalmente

async function seed() {
  try {
    await sequelize.sync({ force: true });
    config.IS_AUDIT_DISABLED = true;
    // Create bodega 'zuccardi'
    const zuccardi = await Bodega.create({
      nombre: 'zuccardi',
      descripcion: 'Bodega Zuccardi',
    });

    // Create a main sucural
    const mainSucursal = await sucursalService.create({
      nombre: 'main',
      es_principal: true,
      direccion: 'direccion 1',
      aclaraciones: 'Sucursal principal de ejemplo',
      bodegaId: zuccardi.id,
    });

    // Create admin role (all permissions except SUDO), related to zuccardi
    const adminRole = await rolesService.create({
      nombre: 'ADMIN',
      bodegaId: zuccardi.id,
    });

    // Create all permissions
    const permissions = await Promise.all(
      Object.values(Permissions).map(async (permission) => {
        return await permissionsService.create({
          nombre: permission,
          clave: permission,
        });
      }),
    );

    // All permissions except SUDO for admin
    const adminPermissions = permissions.filter(
      (p) => p.nombre !== Permissions.SUDO,
    );
    await rolesService.update(adminRole.id, {
      permisos: adminPermissions.map((p) => p.id),
    });

    // Create admin user related to zuccardi
    const adminPassword = await hashPassword('admin123');
    const adminUser = await User.create({
      nombre: 'Admin',
      apellido: 'User',
      email: 'admin@example.com',
      contrasena: adminPassword,
      roles: [adminRole.id],
      bodegaId: zuccardi.id,
      validado: new Date(),
    });
    await adminUser.$set('roles', [adminRole.id]);

    // This new user is a vinza admin, so there is no bodega related to the
    // role nor the user itself

    // Create SUDO role (all permissions), no bodega related
    const sudoRole = await rolesService.create({
      nombre: 'SUDO',
    });
    await rolesService.update(sudoRole.id, {
      permisos: permissions.map((p) => p.id),
    });

    // Create sudoer user with SUDO role and no bodega
    const sudoPassword = await hashPassword('sudo123');
    const sudoer = await User.create({
      nombre: 'sudoer',
      apellido: 'sudoer',
      email: 'sudo@sudo.com',
      contrasena: sudoPassword,
      roles: [sudoRole.id],
      validado: new Date(),
    });
    await sudoer.$set('roles', [sudoRole.id]);

    const [activoEstadoEvento, inactivoEstadoEvento] = await Promise.all(
      ['activo', 'inactivo'].map(async (nombre) => {
        return await estadoEventoService.create({
          nombre,
        });
      }),
    );

    const [categoriaEvento1, categoriaEvento2] = await Promise.all(
      ['categoria 1', 'categoria 2'].map(async (nombre) => {
        return await categoriaEventoService.create({
          nombre,
        });
      }),
    );

    // Evento 1: Clases de yoga semanales
    const evento1 = await eventoService.create({
      nombre: 'Clases de Yoga',
      descripcion: 'Clases de yoga para todos los niveles',
      cupo: '20',
      sucursalId: mainSucursal.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaEvento1.id,
      precio: 150,
      recurrencias: [
        {
          dia: DiaSemana.LUNES,
          hora: HoraEvento.HORA_18_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.MIERCOLES,
          hora: HoraEvento.HORA_18_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.VIERNES,
          hora: HoraEvento.HORA_18_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });

    // Evento 2: Taller de cocina mensual
    const evento2 = await eventoService.create({
      nombre: 'Taller de Cocina',
      descripcion: 'Aprende técnicas de cocina profesional',
      cupo: '15',
      sucursalId: mainSucursal.id,
      estadoId: inactivoEstadoEvento.id,
      categoriaId: categoriaEvento2.id,
      precio: 300,
      recurrencias: [
        {
          dia: DiaSemana.SABADO,
          hora: HoraEvento.HORA_10_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.DOMINGO,
          hora: HoraEvento.HORA_10_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });

    // Evento 3: Charlas de tecnología (múltiples horarios por día)
    const evento3 = await eventoService.create({
      nombre: 'Charlas de Tecnología',
      descripcion: 'Charlas sobre las últimas tendencias en tecnología',
      cupo: '50',
      sucursalId: mainSucursal.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaEvento1.id,
      precio: 200,
      recurrencias: [
        {
          dia: DiaSemana.MARTES,
          hora: HoraEvento.HORA_19_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.MARTES,
          hora: HoraEvento.HORA_20_30,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.JUEVES,
          hora: HoraEvento.HORA_19_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.JUEVES,
          hora: HoraEvento.HORA_20_30,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });

    // Evento 4: Evento único con fecha específica
    const evento4 = await eventoService.create({
      nombre: 'Conferencia Única',
      descripcion: 'Conferencia especial sobre innovación',
      cupo: '100',
      sucursalId: mainSucursal.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaEvento2.id,
      precio: 500,
      recurrencias: [
        {
          dia: DiaSemana.VIERNES,
          hora: HoraEvento.HORA_18_00,
          fecha_desde: new Date('2025-09-15'),
          fecha_hasta: new Date('2025-09-15'),
        },
      ],
    });

    // Create 3 valoraciones for each event
    const valoracionesData = [
      { valor: 5, comentario: 'Excelente evento', userId: adminUser.id },
      { valor: 3, comentario: 'Estuvo bien', userId: adminUser.id },
      { valor: 1, comentario: 'No me gustó', userId: adminUser.id },
    ];
    for (const evento of [evento1, evento2, evento3, evento4]) {
      for (const val of valoracionesData) {
        await Valoracion.create({ ...val, eventoId: evento.id });
      }
    }

    await maximosDiasAdelanteReservaService.patch({ valor: 30 });
    // Create all estado reserva - Comentado temporalmente
    // const estadoReserva = await Promise.all(
    //  Object.values(EstadoReserva).map(async (nombre) => {
    //    return await estadoReservaService.create({
    //      nombre,
    //    });
    //  }),
    // );

    // Create all estado instancia evento
    await Promise.all(
      Object.values(EstadoInstanciaEvento).map(async (nombre) => {
        return await EstadoInstanciaEventoModel.create({
          nombre,
        });
      }),
    );
    // eslint-disable-next-line no-console
    console.log('Database seeded successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    config.IS_AUDIT_DISABLED = false;
  }
}
// Run the seed
seed()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    process.exit(1);
  });
