import type { NextFunction, Request, Response } from 'express';
import { sendNotificationSchema } from './schema';
import { INotificacionService } from './service';

export class NotificacionController {
  readonly notificacionService;

  constructor(notificacionService: INotificacionService) {
    this.notificacionService = notificacionService;
    this.sendNotification = this.sendNotification.bind(this);
  }

  public sendNotification(req: Request, res: Response, next: NextFunction) {
    sendNotificationSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.notificacionService
          .sendNotificationToUser(
            dto.userId,
            dto.titulo,
            dto.descripcion,
            dto.data,
          )
          .then((data) => res.json(data))
          .catch((err) => next(err)),
      )
      .catch((err) => next(err));
  }
}
