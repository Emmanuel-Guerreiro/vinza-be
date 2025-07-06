import { Request, Response } from 'express';
import { AuditService } from './service';
import { auditFilterSchema } from './types';

export class AuditController {
  constructor(private readonly auditService: AuditService) {
    this.findAll = this.findAll.bind(this);
  }

  async findAll(req: Request, res: Response) {
    auditFilterSchema.parseAsync(req.query).then((query) => {
      this.auditService.findAll(query).then((data) => res.json(data));
    });
  }
}
