import { Request, Response } from 'express';
import { RecurrenciaEventoService } from './service';
import { createRecurrenciaEventoSchema, updateRecurrenciaEventoSchema } from './schema';
import { CreateRecurrenciaEventoDto, UpdateRecurrenciaEventoDto } from './types';

export class RecurrenciaEventoController {
  private service = new RecurrenciaEventoService();

  async create(req: Request, res: Response) {
    try {
      const dto = await createRecurrenciaEventoSchema.parseAsync(req.body);
      const data = await this.service.create(dto);
      res.status(201).json(data);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const eventoId = req.query.eventoId ? Number(req.query.eventoId) : undefined;
      const data = await this.service.findAll(eventoId);
      res.json(data);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const recurrencia = await this.service.findById(id);
      
      if (!recurrencia) {
        return res.status(404).json({ error: 'Recurrencia no encontrada' });
      }
      res.json(recurrencia);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const dto = await updateRecurrenciaEventoSchema.parseAsync(req.body);
      const recurrencia = await this.service.update(id, dto);
      
      if (!recurrencia) {
        return res.status(404).json({ error: 'Recurrencia no encontrada' });
      }
      res.json(recurrencia);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await this.service.delete(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async createMany(req: Request, res: Response) {
    try {
      const { recurrencias } = req.body;
      
      if (!Array.isArray(recurrencias)) {
        return res.status(400).json({ error: 'recurrencias debe ser un array' });
      }

      // Debug: mostrar el formato de las fechas
      console.log('Datos recibidos:', JSON.stringify(recurrencias[0], null, 2));

      const validatedRecurrencias = await Promise.all(
        recurrencias.map(recurrencia => createRecurrenciaEventoSchema.parseAsync(recurrencia))
      );
      
      const data = await this.service.createMany(validatedRecurrencias);
      res.status(201).json(data);
    } catch (err) {
      console.log('Error de validación:', JSON.stringify(err, null, 2));
      res.status(400).json(err);
    }
  }
}

