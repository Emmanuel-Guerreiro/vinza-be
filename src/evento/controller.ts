import type { Request, Response } from 'express';
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
  }

  public getAll(req: Request, res: Response) {
    findAllParamsSchema.parseAsync(req.query).then((query) => {
      this.eventoService.findAll(query).then((data) => res.json(data));
    });
  }

  public getOne(req: Request, res: Response) {
    this.eventoService.findOne(+req.params.id).then((data) => res.json(data));
  }

  public create(req: Request, res: Response) {
    createEventoSchema.parseAsync(req.body).then((dto) =>
      this.eventoService
        .create(dto)
        .then((data) => res.json(data))
        .catch((err) => res.json(err)),
    );
  }

  public update(req: Request, res: Response) {
    updateEventoSchema.parseAsync(req.body).then((dto) =>
      this.eventoService
        .update(+req.params.id, dto)
        .then((data) => res.json(data))
        .catch((err) => res.json(err)),
    );
  }

  public delete(req: Request, res: Response) {
    this.eventoService.delete(+req.params.id).then((data) => res.json(data));
  }

  public getInstanciasEvento(req: Request, res: Response) {
    this.eventoService.getInstanciasEvento(+req.params.id).then((data) => res.json(data));
  }

  public generarInstanciasEvento(req: Request, res: Response) {
    this.eventoService.generarInstanciasEvento(+req.params.id)
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
      .catch((err) => res.status(err.status || 500).json(err));
  }

  public suspenderInstanciaEvento(req: Request, res: Response) {
    const eventoId = +req.params.eventoId;
    const instanciaId = +req.params.instanciaId;
    
    this.eventoService.suspenderInstanciaEvento(eventoId, instanciaId)
      .then((data) => res.json(data))
      .catch((err) => res.status(err.status || 500).json(err));
  }

  public reactivarInstanciaEvento(req: Request, res: Response) {
    const eventoId = +req.params.eventoId;
    const instanciaId = +req.params.instanciaId;
    
    this.eventoService.reactivarInstanciaEvento(eventoId, instanciaId)
      .then((data) => res.json(data))
      .catch((err) => res.status(err.status || 500).json(err));
  }
}
