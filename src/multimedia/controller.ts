import { NextFunction, Request, Response } from 'express';
import { IMultimediaService } from './service';
import { errors } from '@/error';
import { createMultimediaFromFileSchema } from './schema';

export class MultimediaController {
  constructor(private readonly multimediaService: IMultimediaService) {
    this.uploadFile = this.uploadFile.bind(this);
  }

  public async uploadFile(req: Request, res: Response, next: NextFunction) {
    const file = req.file;

    if (!file) {
      return next(errors.app.multimedia.file_required);
    }
    createMultimediaFromFileSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.multimediaService
          .uploadFile(file, dto)
          .then((data) => res.json(data))
          .catch((error) => next(error)),
      )
      .catch((error) => next(error));
  }
}
