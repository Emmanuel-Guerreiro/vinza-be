/* eslint-disable no-console */

import { hashPassword } from '@/auth/auth';
import { Bodega } from '@/bodega/model';
import { categoriaEventoService } from '@/categoria-evento/service';
import config from '@/config';
import { EstadoEventoEnum } from '@/estado-evento/enum';
import { estadoEventoService } from '@/estado-evento/service';
import { EstadoInstanciaEventoEnum } from '@/estado-instancia-evento/enum';
import { EstadoInstanciaEvento as EstadoInstanciaEventoModel } from '@/estado-instancia-evento/model';
import { EstadoRecorridoEnum } from '@/estado-recorrido/enum';
import { estadoRecorridoService } from '@/estado-recorrido/service';
import { EstadoReservaEnum } from '@/estado-reserva/enum';
import { estadoReservaService } from '@/estado-reserva/service';
import { DiaSemana, HoraEvento } from '@/evento/model';
import { eventoService } from '@/evento/service';
import { maximosDiasAdelanteReservaService } from '@/maximos-dias-adelante-reserva/service';
import { Permissions } from '@/rbac/permissions';
import { permissionsService, rolesService } from '@/rbac/service';
import { sucursalService } from '@/sucursal/service';
import { User } from '@/users/model';
import { valoracionService } from '@/valoracion/service';
import { faqService } from '@/faqs/service';
import { FaqRecipientsEnum } from '@/faqs/enums';
import { sequelize } from '.';
// import { estadoReservaService } from '@/estado-reserva/service'; // Comentado temporalmente
// import { EstadoReserva } from '@/estado-reserva/enum'; // Comentado temporalmente

async function seed() {
  try {
    await sequelize.sync({ force: true });
    config.IS_AUDIT_DISABLED = true;

    // ========================================
    // 1. CREAR ENTIDADES BÁSICAS
    // ========================================

    // Estados de recorrido
    await Promise.all(
      Object.values(EstadoRecorridoEnum).map((nombre) =>
        estadoRecorridoService.create({
          nombre,
        }),
      ),
    );

    // Create estados de evento
    await Promise.all(
      Object.values(EstadoEventoEnum).map(async (nombre) => {
        return await estadoEventoService.create({
          nombre,
        });
      }),
    );

    // Obtener referencias a los estados creados
    const activoEstadoEvento = await estadoEventoService.findByName(
      EstadoEventoEnum.ACTIVO,
    );
    const suspendidoEstadoEvento = await estadoEventoService.findByName(
      EstadoEventoEnum.SUSPENDIDO,
    );
    const finalizadoEstadoEvento = await estadoEventoService.findByName(
      EstadoEventoEnum.FINALIZADO,
    );

    if (
      !activoEstadoEvento ||
      !suspendidoEstadoEvento ||
      !finalizadoEstadoEvento
    ) {
      throw new Error('Error al crear estados de evento');
    }

    // Create categorías de evento
    const [categoriaEvento1, categoriaEvento2] = await Promise.all(
      ['categoria 1', 'categoria 2'].map(async (nombre) => {
        return await categoriaEventoService.create({
          nombre,
        });
      }),
    );

    // Create estados de instancia evento
    await Promise.all(
      Object.values(EstadoInstanciaEventoEnum).map(async (nombre) => {
        return await EstadoInstanciaEventoModel.create({
          nombre,
        });
      }),
    );

    // Create configuración de días máximos
    await maximosDiasAdelanteReservaService.patch({ valor: 30 });

    // ========================================
    // 2. CREAR PERMISOS Y ROLES
    // ========================================

    // Create all permissions
    const permissions = await Promise.all(
      Object.values(Permissions).map(async (permission) => {
        return await permissionsService.create({
          nombre: permission,
          clave: permission,
        });
      }),
    );

    // Create SUDO role (all permissions), no bodega related
    const sudoRole = await rolesService.create({
      nombre: 'SUDO',
    });
    await rolesService.update(sudoRole.id, {
      permisos: permissions.map((p) => p.id),
    });

    // ========================================
    // 3. CREAR BODEGAS Y SUCURSALES
    // ========================================

    // Create bodega 'zuccardi'
    const zuccardi = await Bodega.create({
      nombre: 'zuccardi',
      descripcion: 'Bodega Zuccardi',
    });

    // Create additional bodegas
    const [bodegaCatena, bodegaTrapiche, bodegaLuigiBosca] = await Promise.all([
      Bodega.create({
        nombre: 'catena-zapata',
        descripcion: 'Bodega Catena Zapata',
      }),
      Bodega.create({
        nombre: 'trapiche',
        descripcion: 'Bodega Trapiche',
      }),
      Bodega.create({
        nombre: 'luigi-bosca',
        descripcion: 'Bodega Luigi Bosca',
      }),
    ]);

    // Create sucursales for zuccardi bodega
    const [mainSucursal, sucursalZuccardi2] = await Promise.all([
      sucursalService.create({
        nombre: 'main',
        es_principal: true,
        direccion: 'direccion 1',
        aclaraciones: 'Sucursal principal de ejemplo',
        bodegaId: zuccardi.id,
      }),
      sucursalService.create({
        nombre: 'zuccardi-2',
        es_principal: false,
        direccion: 'direccion 2',
        aclaraciones: 'Segunda sucursal de Zuccardi',
        bodegaId: zuccardi.id,
      }),
    ]);

    // Create sucursales for Catena Zapata
    const [sucursalCatena1, sucursalCatena2] = await Promise.all([
      sucursalService.create({
        nombre: 'catena-principal',
        es_principal: true,
        direccion: 'Mendoza, Argentina',
        aclaraciones: 'Sucursal principal de Catena Zapata',
        bodegaId: bodegaCatena.id,
      }),
      sucursalService.create({
        nombre: 'catena-secundaria',
        es_principal: false,
        direccion: 'Buenos Aires, Argentina',
        aclaraciones: 'Sucursal secundaria de Catena Zapata',
        bodegaId: bodegaCatena.id,
      }),
    ]);

    // Create sucursales for Trapiche
    const [sucursalTrapiche1, sucursalTrapiche2, sucursalTrapiche3] =
      await Promise.all([
        sucursalService.create({
          nombre: 'trapiche-central',
          es_principal: true,
          direccion: 'Maipú, Mendoza',
          aclaraciones: 'Sucursal central de Trapiche',
          bodegaId: bodegaTrapiche.id,
        }),
        sucursalService.create({
          nombre: 'trapiche-norte',
          es_principal: false,
          direccion: 'Salta, Argentina',
          aclaraciones: 'Sucursal norte de Trapiche',
          bodegaId: bodegaTrapiche.id,
        }),
        sucursalService.create({
          nombre: 'trapiche-sur',
          es_principal: false,
          direccion: 'Neuquén, Argentina',
          aclaraciones: 'Sucursal sur de Trapiche',
          bodegaId: bodegaTrapiche.id,
        }),
      ]);

    // Create sucursales for Luigi Bosca
    const [sucursalLuigiBosca1] = await Promise.all([
      sucursalService.create({
        nombre: 'luigi-bosca-mendoza',
        es_principal: true,
        direccion: 'Luján de Cuyo, Mendoza',
        aclaraciones: 'Sucursal principal de Luigi Bosca',
        bodegaId: bodegaLuigiBosca.id,
      }),
    ]);

    // ========================================
    // 4. CREAR ROLES ESPECÍFICOS DE BODEGA
    // ========================================

    // Create admin role (all permissions except SUDO), related to zuccardi
    const adminRole = await rolesService.create({
      nombre: 'ADMIN',
      bodegaId: zuccardi.id,
    });

    // All permissions except SUDO for admin
    const adminPermissions = permissions.filter(
      (p) => p.nombre !== Permissions.SUDO,
    );
    await rolesService.update(adminRole.id, {
      permisos: adminPermissions.map((p) => p.id),
    });

    // Create operador role (limited permissions - no event management)
    const operadorRole = await rolesService.create({
      nombre: 'OPERADOR',
      bodegaId: zuccardi.id,
    });

    // Limited permissions for operador: read permissions + reservations management
    const operadorPermissions = permissions.filter(
      (p) =>
        p.nombre === Permissions.EVENTOS_READ ||
        p.nombre === Permissions.RESERVAS_READ ||
        p.nombre === Permissions.RESERVAS_MANAGE ||
        p.nombre === Permissions.INSTANCIA_EVENTOS_READ ||
        p.nombre === Permissions.VALORACIONES_READ ||
        p.nombre === Permissions.BODEGAS_READ ||
        p.nombre === Permissions.USERS_READ,
    );

    await rolesService.update(operadorRole.id, {
      permisos: operadorPermissions.map((p) => p.id),
    });

    // ========================================
    // 5. CREAR USUARIOS
    // ========================================

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

    // Create operador user with limited permissions
    const operadorPassword = await hashPassword('operador123');
    const operadorUser = await User.create({
      nombre: 'Operador',
      apellido: 'Zuccardi',
      email: 'operador@zuccardi.com',
      contrasena: operadorPassword,
      roles: [operadorRole.id],
      bodegaId: zuccardi.id,
      validado: new Date(),
    });
    await operadorUser.$set('roles', [operadorRole.id]);

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

    // ========================================
    // 5.1 CREAR USUARIOS PARA CADA BODEGA
    // ========================================

    // Create user for Catena Zapata (usa el mismo rol ADMIN)
    const adminCatenaPassword = await hashPassword('catena123');
    const adminCatena = await User.create({
      nombre: 'Admin',
      apellido: 'Catena',
      email: 'admin@catena.com',
      contrasena: adminCatenaPassword,
      roles: [adminRole.id], // Mismo rol ADMIN
      bodegaId: bodegaCatena.id,
      validado: new Date(),
    });
    await adminCatena.$set('roles', [adminRole.id]);

    // Create user for Trapiche (usa el mismo rol ADMIN)
    const adminTrapichePassword = await hashPassword('trapiche123');
    const adminTrapiche = await User.create({
      nombre: 'Admin',
      apellido: 'Trapiche',
      email: 'admin@trapiche.com',
      contrasena: adminTrapichePassword,
      roles: [adminRole.id], // Mismo rol ADMIN
      bodegaId: bodegaTrapiche.id,
      validado: new Date(),
    });
    await adminTrapiche.$set('roles', [adminRole.id]);

    // Create user for Luigi Bosca (usa el mismo rol ADMIN)
    const adminLuigiBoscaPassword = await hashPassword('luigibosca123');
    const adminLuigiBosca = await User.create({
      nombre: 'Admin',
      apellido: 'Luigi Bosca',
      email: 'admin@luigibosca.com',
      contrasena: adminLuigiBoscaPassword,
      roles: [adminRole.id], // Mismo rol ADMIN
      bodegaId: bodegaLuigiBosca.id,
      validado: new Date(),
    });
    await adminLuigiBosca.$set('roles', [adminRole.id]);

    // ========================================
    // 6. CREAR EVENTOS
    // ========================================

    // Evento 1: Clases de yoga semanales
    const evento1 = await eventoService.create({
      nombre: 'Clases de Yoga',
      descripcion: 'Clases de yoga para todos los niveles',
      cupo: 20,
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
    console.log('Evento 1 creado');

    // Evento 2: Taller de cocina mensual
    const evento2 = await eventoService.create({
      nombre: 'Taller de Cocina',
      descripcion: 'Aprende técnicas de cocina profesional',
      cupo: 15,
      sucursalId: mainSucursal.id,
      estadoId: suspendidoEstadoEvento.id,
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
    console.log('Evento 2 creado');

    // Evento 3: Charlas de tecnología (múltiples horarios por día)
    const evento3 = await eventoService.create({
      nombre: 'Charlas de Tecnología',
      descripcion: 'Charlas sobre las últimas tendencias en tecnología',
      cupo: 50,
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
    console.log('Evento 3 creado');

    // Evento 4: Evento único con fecha específica
    const evento4 = await eventoService.create({
      nombre: 'Conferencia Única',
      descripcion: 'Conferencia especial sobre innovación',
      cupo: 100,
      sucursalId: mainSucursal.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaEvento2.id,
      precio: 500,
      recurrencias: [
        {
          dia: DiaSemana.VIERNES,
          hora: HoraEvento.HORA_18_00,
          fecha_desde: new Date('2025-10-15'),
          fecha_hasta: new Date('2025-10-15'),
        },
      ],
    });

    // Evento 5: Cata de vinos en Catena Zapata (Mendoza)
    const evento5 = await eventoService.create({
      nombre: 'Cata de Vinos Premium',
      descripcion: 'Degustación de vinos premium de Catena Zapata',
      cupo: 25,
      sucursalId: sucursalCatena1.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaEvento1.id,
      precio: 800,
      recurrencias: [
        {
          dia: DiaSemana.SABADO,
          hora: HoraEvento.HORA_16_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 5 creado');

    // Evento 6: Tour gastronómico en Catena (Buenos Aires)
    const evento6 = await eventoService.create({
      nombre: 'Tour Gastronómico',
      descripcion: 'Recorrido por la gastronomía porteña con vinos Catena',
      cupo: 30,
      sucursalId: sucursalCatena2.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaEvento2.id,
      precio: 1200,
      recurrencias: [
        {
          dia: DiaSemana.DOMINGO,
          hora: HoraEvento.HORA_11_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 6 creado');

    // Evento 7: Clases de cocina regional en Trapiche Central
    const evento7 = await eventoService.create({
      nombre: 'Cocina Regional Mendocina',
      descripcion: 'Aprende a cocinar platos típicos de Mendoza',
      cupo: 18,
      sucursalId: sucursalTrapiche1.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaEvento2.id,
      precio: 450,
      recurrencias: [
        {
          dia: DiaSemana.MIERCOLES,
          hora: HoraEvento.HORA_19_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.SABADO,
          hora: HoraEvento.HORA_15_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });

    console.log('Evento 7 creado');

    // Evento 8: Festival de vinos del norte en Trapiche Norte
    const evento8 = await eventoService.create({
      nombre: 'Festival de Vinos del Norte',
      descripcion: 'Celebración de vinos de altura de Salta',
      cupo: 60,
      sucursalId: sucursalTrapiche2.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaEvento1.id,
      precio: 350,
      recurrencias: [
        {
          dia: DiaSemana.VIERNES,
          hora: HoraEvento.HORA_20_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 8 creado');

    // Evento 9: Enología para principiantes en Trapiche Sur
    const evento9 = await eventoService.create({
      nombre: 'Enología para Principiantes',
      descripcion: 'Introducción al mundo del vino y la enología',
      cupo: 35,
      sucursalId: sucursalTrapiche3.id,
      estadoId: suspendidoEstadoEvento.id,
      categoriaId: categoriaEvento1.id,
      precio: 280,
      recurrencias: [
        {
          dia: DiaSemana.JUEVES,
          hora: HoraEvento.HORA_18_30,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 9 creado');

    // Evento 10: Maridaje de vinos en Luigi Bosca
    const evento10 = await eventoService.create({
      nombre: 'Maridaje de Vinos y Quesos',
      descripcion: 'Aprende a combinar vinos con diferentes tipos de queso',
      cupo: 22,
      sucursalId: sucursalLuigiBosca1.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaEvento2.id,
      precio: 600,
      recurrencias: [
        {
          dia: DiaSemana.MARTES,
          hora: HoraEvento.HORA_19_30,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.SABADO,
          hora: HoraEvento.HORA_17_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 10 creado');

    // Evento 11: Evento especial en Zuccardi segunda sucursal
    const evento11 = await eventoService.create({
      nombre: 'Noche de Malbec',
      descripcion: 'Celebración especial del Malbec argentino',
      cupo: 40,
      sucursalId: sucursalZuccardi2.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaEvento1.id,
      precio: 400,
      recurrencias: [
        {
          dia: DiaSemana.VIERNES,
          hora: HoraEvento.HORA_21_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 11 creado');

    // Evento 12: Evento único en Luigi Bosca
    const evento12 = await eventoService.create({
      nombre: 'Gran Cena de Gala',
      descripcion: 'Cena de gala con vinos premium de Luigi Bosca',
      cupo: 80,
      sucursalId: sucursalLuigiBosca1.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaEvento2.id,
      precio: 1500,
      recurrencias: [
        {
          dia: DiaSemana.SABADO,
          hora: HoraEvento.HORA_20_00,
          fecha_desde: new Date('2025-12-20'),
          fecha_hasta: new Date('2025-12-20'),
        },
      ],
    });
    console.log('Evento 12 creado');

    // ========================================
    // 7. CREAR VALORACIONES
    // ========================================

    // Create 3 valoraciones for each event
    const valoracionesData = [
      { valor: 5, comentario: 'Excelente evento', userId: adminUser.id },
      { valor: 3, comentario: 'Estuvo bien', userId: adminUser.id },
      { valor: 1, comentario: 'No me gustó', userId: adminUser.id },
      { valor: 4, comentario: 'Me gustó', userId: adminUser.id },
    ];
    for (const evento of [
      evento1,
      evento2,
      evento3,
      evento4,
      evento5,
      evento6,
      evento7,
      evento8,
      evento9,
      evento10,
      evento11,
      evento12,
    ]) {
      for (const val of valoracionesData) {
        if (Math.random() < 0.5) {
          await valoracionService.create({
            ...val,
            eventoId: evento.id,
          });
        }
      }
    }

    await maximosDiasAdelanteReservaService.patch({ valor: 30 });

    // ========================================
    // 8. CREAR FAQS
    // ========================================

    // Create FAQ recipients
    const [endRecipient, bodegasRecipient] = await Promise.all([
      faqService.createRecipient({
        name: FaqRecipientsEnum.END,
        label: 'Usuarios finales',
      }),
      faqService.createRecipient({
        name: FaqRecipientsEnum.BODEGAS,
        label: 'Administradores de bodegas',
      }),
    ]);

    // Create FAQ 1: About bodega validation (for administrators)
    await faqService.createFaq({
      question: '¿Cómo funciona la validación de bodegas?',
      answer:
        'La validación de bodegas es un proceso manual que realizan los administradores del sistema. Cuando una nueva bodega solicita acceso, los administradores revisan la documentación y verifican que cumpla con todos los requisitos antes de aprobar su ingreso a la plataforma. Este proceso puede tomar entre 2 a 5 días hábiles.',
      recipient_id: bodegasRecipient.id,
    });

    // Create FAQ 2: About recurring events (for end users)
    await faqService.createFaq({
      question: '¿Qué son los eventos recurrentes?',
      answer:
        'Los eventos recurrentes son actividades que se repiten periódicamente siguiendo un patrón establecido. Por ejemplo, clases de yoga todos los lunes y miércoles, o catas de vinos los primeros sábados de cada mes. Estos eventos te permiten planificar con anticipación y participar regularmente en las actividades que más te interesan.',
      recipient_id: endRecipient.id,
    });

    console.log('FAQs creados exitosamente');

    // ========================================
    // 9. ESTADOS DE RESERVA (COMENTADO TEMPORALMENTE)
    // ========================================

    // Create all estado reserva - Comentado temporalmente
    await Promise.all(
      Object.values(EstadoReservaEnum).map(async (nombre) => {
        return await estadoReservaService.create({
          nombre,
        });
      }),
    );

    console.log('Database seeded successfully');

    // ========================================
    // INFORMACIÓN DE USUARIOS PARA PRUEBAS
    // ========================================
    console.log('\n=== USUARIOS CREADOS PARA PRUEBAS ===');
    console.log('SUDO (Sin bodega - Acceso total):');
    console.log('  Email: sudo@sudo.com | Password: sudo123');
    console.log('\nADMIN ZUCCARDI (Bodega 1):');
    console.log('  Email: admin@example.com | Password: admin123');
    console.log('  Puede acceder a eventos de Zuccardi');
    console.log('\nOPERADOR ZUCCARDI (Bodega 1):');
    console.log('  Email: operador@zuccardi.com | Password: operador123');
    console.log('  Solo lectura de eventos y gestión de reservas');
    console.log('\nADMIN CATENA ZAPATA (Bodega 2):');
    console.log('  Email: admin@catena.com | Password: catena123');
    console.log('  Puede acceder a eventos de Catena Zapata');
    console.log('\nADMIN TRAPICHE (Bodega 3):');
    console.log('  Email: admin@trapiche.com | Password: trapiche123');
    console.log('  Puede acceder a eventos de Trapiche');
    console.log('\nADMIN LUIGI BOSCA (Bodega 4):');
    console.log('  Email: admin@luigibosca.com | Password: luigibosca123');
    console.log('  Puede acceder a eventos de Luigi Bosca');
    console.log('\n=== PRUEBAS DE AUTORIZACIÓN ===');
    console.log('1. Login con admin@catena.com');
    console.log(
      '2. Intentar crear evento en sucursal de Zuccardi → Debe fallar (403)',
    );
    console.log('3. Crear evento en sucursal de Catena → Debe funcionar (201)');
    console.log('4. Intentar modificar evento de Trapiche → Debe fallar (403)');
    console.log('5. Modificar evento de Catena → Debe funcionar (200)');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    config.IS_AUDIT_DISABLED = false;
  }
}

// Run the seed
seed()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
