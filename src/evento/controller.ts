import type { Request, Response, NextFunction } from 'express';
import {
  createEventoSchema,
  findAllParamsSchema,
  updateEventoSchema,
} from './schema';
import { IEventoService } from './service';

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

  public create(req: Request, res: Response, next: NextFunction) {
    const dto = createEventoSchema.parse(req.body);
    this.eventoService
      .create(dto)
      .then((data) => res.json(data))
      .catch((err) => next(err));
  }

  public update(req: Request, res: Response, next: NextFunction) {
    const dto = updateEventoSchema.parse(req.body);
    this.eventoService
      .update(+req.params.id, dto)
      .then((data) => res.json(data))
      .catch((err) => next(err));
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
}
