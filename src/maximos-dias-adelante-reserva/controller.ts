import { Request, Response } from 'express';
import { createMaximosDiasAdelanteReservaSchema } from './schema';
import { maximosDiasAdelanteReservaService } from './service';

export class MaximosDiasAdelanteReservaController {
  constructor() {
    this.findAll = this.findAll.bind(this);
    this.patch = this.patch.bind(this);
  }

  async findAll(_req: Request, res: Response) {
    maximosDiasAdelanteReservaService.findAll().then((r) => res.json(r));
  }

  async patch(req: Request, res: Response) {
    createMaximosDiasAdelanteReservaSchema
      .parseAsync(req.body)
      .then((data) =>
        maximosDiasAdelanteReservaService.patch(data).then((r) => res.json(r)),
      );
  }
}
