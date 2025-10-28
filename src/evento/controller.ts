import type { NextFunction, Request, Response } from 'express';
import {
  createEventoSchema,
  findAllParamsSchema,
  updateEventoSchema,
} from './schema';
import { IEventoService } from './service';
import { instanciaEventoService } from '@/instancia-evento/service';
import { findAllParamsSchema as instanciaEventoFindAllParamsSchema } from '@/instancia-evento/schema';

export class EventoController {
  readonly eventoService;

  constructor(eventoService: IEventoService) {
    this.eventoService = eventoService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getInstanciasEvento = this.getInstanciasEvento.bind(this);
    this.generarInstanciasEvento = this.generarInstanciasEvento.bind(this);
    this.suspenderInstanciaEvento = this.suspenderInstanciaEvento.bind(this);
    this.reactivarInstanciaEvento = this.reactivarInstanciaEvento.bind(this);
    this.getInstanciaEvento = this.getInstanciaEvento.bind(this);
    this.getAllByBodega = this.getAllByBodega.bind(this);
    this.obtenerReservasInstancia = this.obtenerReservasInstancia.bind(this);
    this.canDelete = this.canDelete.bind(this);
    this.getInstanciasEventos = this.getInstanciasEventos.bind(this);
  }

  public getAll(req: Request, res: Response) {
    const query = findAllParamsSchema.parse(req.query);
    this.eventoService.findAll(query).then((data) => res.json(data));
  }

  public getOne(req: Request, res: Response, next: NextFunction) {
    this.eventoService
      .findOne(+req.params.id)
      .then((data) => res.json(data))
      .catch((err) => next(err));
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = createEventoSchema.parse({
        ...req.body,
        // This is ugly, but zod is failing to transform pre parsing
        recurrencias: JSON.parse(req.body.recurrencias),
      });
      const files = req.files as Express.Multer.File[];
      // Create the evento
      const evento = await this.eventoService.createWithMultimedia(
        dto,
        files ?? [],
      );
      res.json(evento);
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = updateEventoSchema.parse({
        ...req.body,
        // Parse JSON fields from form data
        recurrencias: req.body.recurrencias
          ? JSON.parse(req.body.recurrencias)
          : undefined,
        removeMultimedia: req.body.removeMultimedia
          ? JSON.parse(req.body.removeMultimedia)
          : undefined,
      });
      const files = req.files as Express.Multer.File[];
      // Update the evento
      const evento = await this.eventoService.update(+req.params.id, {
        ...dto,
        addMultimedia: files ?? [],
      });
      res.json(evento);
    } catch (err) {
      next(err);
    }
  }

  public delete(req: Request, res: Response) {
    this.eventoService.delete(+req.params.id).then((data) => res.json(data));
  }

  public getInstanciasEvento(req: Request, res: Response) {
    this.eventoService
      .getInstanciasEvento(+req.params.id)
      .then((data) => res.json(data));
  }

  public generarInstanciasEvento(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    this.eventoService
      .generarInstanciasEvento(+req.params.id)
      .then((data) => {
        if (!data) {
          // Si no hay datos, responder con error
          res.status(500).json({ error: 'No se pudo generar instancias' });
          return;
        }

        // Si es un evento único, responder con 200 pero con mensaje informativo
        if ('tipo' in data && data.tipo === 'evento_unico') {
          res.status(200).json(data);
        } else {
          // Si se generaron instancias, responder normalmente
          res.json(data);
        }
      })
      .catch((err) => next(err));
  }

  public suspenderInstanciaEvento(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const instanciaId = +req.params.instanciaId;

    this.eventoService
      .suspenderInstanciaEvento(instanciaId)
      .then((data) => res.json(data))
      .catch((err) => next(err));
  }

  public reactivarInstanciaEvento(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const instanciaId = +req.params.instanciaId;

    this.eventoService
      .reactivarInstanciaEvento(instanciaId)
      .then((data) => res.json(data))
      .catch((err) => next(err));
  }

  public getInstanciaEvento(req: Request, res: Response, next: NextFunction) {
    this.eventoService
      .findByInstanciaEvento(+req.params.instanciaId)
      .then((data) => res.json(data))
      .catch((err) => next(err));
  }

  public getAllByBodega(req: Request, res: Response) {
    const query = findAllParamsSchema.parse(req.query);
    // Filtrar por la bodega del usuario autenticado
    if (typeof req.bodegaId !== 'undefined' && req.bodegaId !== null) {
      (query as unknown as { bodegaId?: number }).bodegaId = req.bodegaId;
    }
    this.eventoService.findAll(query).then((data) => res.json(data));
  }

  public obtenerReservasInstancia(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    this.eventoService
      .obtenerReservasInstancia(+req.params.instanciaId)
      .then((data) => res.json(data))
      .catch((err) => next(err));
  }

  public canDelete(req: Request, res: Response, next: NextFunction) {
    this.eventoService
      .canDelete(+req.params.id)
      .then((data) => res.json(data))
      .catch((err) => next(err));
  }

  public getInstanciasEventos(req: Request, res: Response, next: NextFunction) {
    try {
      const query = instanciaEventoFindAllParamsSchema.parse({
        ...req.query,
        bodegaId: req.bodegaId,
      });
      // Add bodegaId filter if user is authenticated and has bodegaId

      instanciaEventoService
        .findAll(query)
        .then((data) => res.json(data))
        .catch((err) => next(err));
    } catch (err) {
      next(err);
    }
  }
}
