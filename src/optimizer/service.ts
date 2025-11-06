import config from '@/config';
import { Recorrido } from '@/recorrido/model';
import { instanciaEventoService } from '@/instancia-evento/service';
import { InstanciaEvento } from '@/instancia-evento/model';
import { Op } from 'sequelize';
import { Evento } from '@/evento/model';
import { Sucursal } from '@/sucursal/model';

type waypointItem = {
  waypoint: {
    location: {
      latLng: {
        latitude: number;
        longitude: number;
      };
    };
  };
};

type GoogleItemResponse = {
  originIndex: number;
  destinationIndex: number;
  status: object;
  duration: string;
};

/**
 * Represents a single event occurrence instance
 */
export interface EventInstanceEntry {
  event: number;
  day: number;
  start: number;
  end: number;
  loc: string;
}

/**
 * Travel distance between two locations
 * Key format: "fromLocation_toLocation"
 * Value: travel time in minutes
 */
export type TravelDistances = Record<string, number>;

/**
 * Request payload for the /optimize endpoint
 */
export interface OptimizationRequest {
  occurrences: Record<string, EventInstanceEntry>;
  travel_distances: TravelDistances;
  buffer_minutes?: number; // Optional, defaults to 60
}

/**
 * Response from the /optimize endpoint
 */
export interface OptimizationResponse {
  schedule: Record<number, string[]>; // day -> array of occurrence keys
  days_used: number;
  chosen_occurrences: string[];
  status: string;
  timestamp: string; // ISO 8601 format
}

export class OptimizerService {
  public async optimizeRecorrido(recorrido: Recorrido) {
    const uniqueSucursales = [
      ...new Set(
        recorrido.reservas
          .map((reserva) => reserva.instanciaEvento.evento?.sucursal?.id)
          .filter((sucursal) => sucursal !== undefined),
      ),
    ];

    const positions: waypointItem[] = uniqueSucursales.map((sucursalId) => {
      const sucursal = recorrido.reservas.find(
        (reserva) =>
          reserva.instanciaEvento.evento?.sucursal?.id === sucursalId,
      )?.instanciaEvento.evento?.sucursal;

      if (!sucursal) {
        throw new Error('Malformed sucursal');
      }
      return {
        waypoint: {
          location: {
            latLng: {
              latitude: sucursal.latitude,
              longitude: sucursal.longitude,
            },
          },
        },
      };
    });

    const data = await this.fetchTravelDistances(positions);

    // Convert Google response to matrix mapping (sucIdOrigin, sucIdDest): time in minutes
    const durationMatrix: TravelDistances = {};

    data.forEach((item) => {
      const originSucId = uniqueSucursales[item.originIndex];
      const destinationSucId = uniqueSucursales[item.destinationIndex];

      if (originSucId && destinationSucId) {
        // Extract seconds from duration string (format: "123s")
        const durationInSeconds = parseInt(item.duration.replace('s', ''));
        const durationInMinutes = Math.round(durationInSeconds / 60);

        const key = `${originSucId},${destinationSucId}`;
        durationMatrix[key] = durationInMinutes;
      }
    });

    // Extract all unique eventos from reservas
    const uniqueEventos = [
      ...new Set(
        recorrido.reservas
          .map((reserva) => reserva.instanciaEvento.evento?.id)
          .filter((eventoId) => eventoId !== undefined),
      ),
    ];

    // Find the date range between first and last event instance dates
    const allInstanciaDates = recorrido.reservas
      .map((reserva) => new Date(reserva.instanciaEvento.fecha))
      .sort((a, b) => a.getTime() - b.getTime());

    const fechaDesde = allInstanciaDates[0];
    const fechaHasta = allInstanciaDates[allInstanciaDates.length - 1];

    // For each evento, find all instanciaEvento instances within the date range

    const allEventInstances: EventInstanceEntry[] = [];

    for (const eventoId of uniqueEventos) {
      // Find all instances for this evento within the date range
      const instanciasResponse = await instanciaEventoService.findAll({
        eventoId,
        fechaDesde,
        fechaHasta,
        page: 1,
        limit: 1000, // High limit to get all instances
        orderBy: 'fecha:asc',
      });

      // Convert each instanciaEvento to EventInstanceEntry
      const eventoInstances = instanciasResponse.items.map((instancia) => {
        const evento = instancia.evento;
        if (!evento) {
          throw new Error('Missing evento data');
        }

        // Use the actual date and time from instanciaEvento
        const eventDate = new Date(instancia.fecha);
        const day = eventDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Extract time from the ISO string (hours and minutes since midnight)
        const start = eventDate.getHours() * 60 + eventDate.getMinutes();

        // For now, assume events last 2 hours (120 minutes)
        // This could be made configurable or stored in the database
        const eventDuration = 120; // minutes
        const end = start + eventDuration;

        // Use sucursal ID as location identifier
        const loc = evento.sucursal?.id?.toString() ?? '';

        return {
          event: instancia.id,
          day,
          start,
          end,
          loc,
        };
      });

      allEventInstances.push(...eventoInstances);
    }

    const eventInstances = allEventInstances;

    // Create optimization request
    const optimizationRequest: OptimizationRequest = {
      occurrences: this.createOccurrencesMap(eventInstances),
      travel_distances: durationMatrix,
      buffer_minutes: 60, // Default buffer of 60 minutes
    };

    // Send optimization request
    const optimizationResponse =
      await this.sendOptimizationRequest(optimizationRequest);

    return this.generateStructuredResponse(recorrido, optimizationResponse);
  }

  private async generateStructuredResponse(
    originalRecorrido: Recorrido,
    optimizationResponse: OptimizationResponse,
  ) {
    const allInstances = await InstanciaEvento.findAll({
      where: {
        id: {
          [Op.in]: optimizationResponse.chosen_occurrences.map((id) =>
            parseInt(id),
          ),
        },
      },
      include: [
        {
          model: Evento,
          as: 'evento',
          include: [
            {
              model: Sucursal,
              as: 'sucursal',
            },
          ],
        },
      ],
      order: [['fecha', 'ASC']],
    });

    const seenEventIds = new Set<number>();
    const instances = allInstances.filter((instance) => {
      const eventoId = instance.eventoId;
      if (seenEventIds.has(eventoId)) {
        return false;
      }
      seenEventIds.add(eventoId);
      return true;
    });

    return {
      originalInstances: originalRecorrido.reservas.map(
        (reserva) => reserva.instanciaEvento.id,
      ),
      instancesIds: optimizationResponse.chosen_occurrences,
      instances,
    };
  }

  /**
   * Creates a map of occurrence keys to EventInstanceEntry objects
   * Each instance gets a unique key combining event ID and instance index
   */
  private createOccurrencesMap(
    eventInstances: EventInstanceEntry[],
  ): Record<string, EventInstanceEntry> {
    const occurrencesMap: Record<string, EventInstanceEntry> = {};

    eventInstances.forEach((instance) => {
      // Create unique key for each instance: eventId_instanceIndex
      const key = `${instance.event}`;
      occurrencesMap[key] = instance;
    });

    return occurrencesMap;
  }

  /**
   * Sends optimization request to the external optimization service
   */
  private async sendOptimizationRequest(
    request: OptimizationRequest,
  ): Promise<OptimizationResponse> {
    const response = await fetch(`${config.OPTIMIZATION_URL}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Optimization request failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const optimizationResponse: OptimizationResponse = await response.json();
    return optimizationResponse;
  }

  /**
   * Fetches travel distances between locations using Google Maps API
   */
  private async fetchTravelDistances(
    positions: waypointItem[],
  ): Promise<GoogleItemResponse[]> {
    const body = {
      origins: positions,
      destinations: positions,
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      units: 'METRIC',
    };

    const res = await fetch(
      'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': config.GOOGLE_MAPS_API_KEY as string,
          'X-Goog-FieldMask':
            'originIndex,destinationIndex,duration,distanceMeters,status',
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `Failed to fetch travel distances: ${res.status} ${res.statusText} - ${JSON.stringify(errorData)}`,
      );
    }

    return res.json();
  }

  // Helper if the API returns "PT3H55M" style strings
  private parseDurationToSeconds(isoString: string) {
    const match = isoString?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const [, h, m, s] = match.map((x) => parseInt((x as string) || '0'));
    return h * 3600 + m * 60 + s;
  }
}

export const optimizerService = new OptimizerService();
export type IOptimizerService = typeof OptimizerService;
