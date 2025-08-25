# Módulo Instancia Evento

Este módulo maneja las instancias concretas de eventos. Una instancia de evento representa una ocurrencia específica de un evento en una fecha y hora determinada.

## Estructura

- **`model.ts`**: Define el modelo de datos `InstanciaEvento` con sus relaciones
- **`types.ts`**: Define los tipos TypeScript usando zod infer (CreateInstanciaEventoDto, UpdateInstanciaEventoDto, FindAllParams)
- **`schema.ts`**: Define los esquemas de validación para crear, actualizar y consultar instancias
- **`service.ts`**: Contiene la lógica de negocio, incluyendo el método para generar instancias automáticamente
- **`index.ts`**: Exporta el servicio y tipos principales

## Funcionalidades

### Generación Automática de Instancias

El servicio incluye un método `generarInstanciasAutomaticamente()` que:

1. **Obtiene la configuración** de días máximos adelante desde `maximos-dias-adelante-reserva`
2. **Busca eventos activos** que tengan recurrencias con `fecha_hasta` mayor a la actual
3. **Genera instancias** para cada recurrencia según:
   - El día de la semana configurado
   - La hora configurada
   - Los días máximos adelante permitidos
   - La fecha hasta de la recurrencia

### Ejemplo de Uso

```typescript
import { instanciaEventoService } from '@/instancia-evento';

// Generar instancias automáticamente
const resultado = await instanciaEventoService.generarInstanciasAutomaticamente();
console.log(`Instancias creadas: ${resultado.totalInstanciasCreadas}`);

// Crear una instancia manualmente
const nuevaInstancia = await instanciaEventoService.create({
  fecha: new Date('2025-01-20T10:00:00'),
  eventoId: 1,
  recurrenciaEventoId: 1,
  estadoId: 1
});

// Actualizar una instancia
await instanciaEventoService.update(1, {
  fecha: new Date('2025-01-20T11:00:00'),
  estadoId: 2
});

// Buscar instancias con filtros
const instancias = await instanciaEventoService.findAll({
  eventoId: 1,
  fechaDesde: new Date('2025-01-01'),
  fechaHasta: new Date('2025-01-31'),
  page: 1,
  limit: 10
});
```

### Cron Job

El módulo incluye un cron job configurado para ejecutarse diariamente a la 1:00 AM que llama automáticamente a `generarInstanciasAutomaticamente()`.

## Relaciones

- **Evento**: Una instancia pertenece a un evento
- **RecurrenciaEvento**: Una instancia se genera basada en una recurrencia específica
- **EstadoInstanciaEvento**: Una instancia puede tener un estado (opcional)
- **HEstadoInstanciaEvento**: Historial de cambios de estado de la instancia

## Campos del Modelo

- `id`: Identificador único
- `fecha`: Fecha y hora de la instancia
- `eventoId`: ID del evento al que pertenece
- `recurrenciaEventoId`: ID de la recurrencia que generó esta instancia
- `estadoId`: ID del estado actual (opcional)
- `created_at`, `updated_at`, `deleted_at`: Timestamps de auditoría

## Schemas de Validación

### CreateInstanciaEventoSchema
- `fecha`: Fecha futura obligatoria
- `eventoId`: ID del evento (número positivo obligatorio)
- `recurrenciaEventoId`: ID de la recurrencia (número positivo obligatorio)
- `estadoId`: ID del estado (opcional, número positivo)

### UpdateInstanciaEventoSchema
- Todos los campos son opcionales
- Mismas validaciones que el schema de creación

### FindAllParamsSchema
- **Filtros básicos**: `eventoId`, `recurrenciaEventoId`, `estadoId`
- **Filtros de fecha**: `fechaDesde`, `fechaHasta` (con validación de rango)
- **Filtros adicionales**: `nombreEvento`, `categoriaEventoId`, `sucursalId`
- **Filtros de precio**: `precioMaximo`, `precioMinimo`
- **Paginación y ordenamiento**: Estándar del sistema

## Filtros Disponibles

- `eventoId`: Filtrar por evento específico
- `recurrenciaEventoId`: Filtrar por recurrencia específica
- `estadoId`: Filtrar por estado
- `fechaDesde` / `fechaHasta`: Filtrar por rango de fechas
- `nombreEvento`: Filtrar por nombre del evento
- `categoriaEventoId`: Filtrar por categoría del evento
- `sucursalId`: Filtrar por sucursal
- `precioMaximo` / `precioMinimo`: Filtrar por rango de precios
- Paginación y ordenamiento estándar

