import { Request, Response } from 'express';
import { RecurrenciaEventoService } from './service';
import { createRecurrenciaEventoSchema, updateRecurrenciaEventoSchema } from './schema';
import { CreateRecurrenciaEventoDto, UpdateRecurrenciaEventoDto } from './types';

export class RecurrenciaEventoController {
  private service = new RecurrenciaEventoService();



  async create(req: Request, res: Response) {
    createRecurrenciaEventoSchema.parseAsync(req.body).then((dto) =>
      this.service
        .create(dto)
        .then((data) => res.status(201).json(data))
        .catch((err) => res.json(err)),
    );
  }

  async findAll(req: Request, res: Response) {
    const eventoId = req.query.eventoId ? Number(req.query.eventoId) : undefined;
    this.service
      .findAll(eventoId)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).json(err));
  }

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);
    this.service
      .findById(id)
      .then((recurrencia) => {
        if (!recurrencia) {
          return res.status(404).json({ error: 'Recurrencia no encontrada' });
        }
        res.json(recurrencia);
      })
      .catch((err) => res.status(500).json(err));
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    updateRecurrenciaEventoSchema.parseAsync(req.body).then((dto) =>
      this.service
        .update(id, dto)
        .then((recurrencia) => {
          if (!recurrencia) {
            return res.status(404).json({ error: 'Recurrencia no encontrada' });
          }
          res.json(recurrencia);
        })
        .catch((err) => res.json(err)),
    );
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    this.service
      .delete(id)
      .then(() => res.status(204).send())
      .catch((err) => res.status(500).json(err));
  }

  async createMany(req: Request, res: Response) {
    const { recurrencias } = req.body;
    
    if (!Array.isArray(recurrencias)) {
      return res.status(400).json({ error: 'recurrencias debe ser un array' });
    }

    Promise.all(
      recurrencias.map(recurrencia => createRecurrenciaEventoSchema.parseAsync(recurrencia))
    ).then((validatedRecurrencias) =>
      this.service
        .createMany(validatedRecurrencias)
        .then((data) => res.status(201).json(data))
        .catch((err) => res.json(err)),
    );
  }
}

