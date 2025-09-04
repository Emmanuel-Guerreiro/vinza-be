import { IStorageService, storageService } from '@/storage/service';
import { MultimediaBodegas, MultimediaEventos } from './model';
import { Transaction } from 'sequelize';

export class MultimediaService {
  constructor(private readonly storageService: IStorageService) {}

  public async uploadMultipleFilesForEvento(
    {
      files,
      eventoId,
      portadaFileName,
    }: {
      files: Express.Multer.File[];
      eventoId: number;
      portadaFileName?: string | null;
    },
    transaction?: Transaction,
  ) {
    const uploadPromises = files.map(async (file) => {
      const { buffer, originalname, mimetype } = file;
      const parsedName = originalname.replace(/ /g, '_');
      const url = await this.storageService.createItem(
        parsedName + '-' + Date.now(),
        buffer,
        mimetype,
      );

      return MultimediaEventos.create(
        {
          url,
          es_portada: portadaFileName === originalname ? new Date() : null,
          eventoId,
        },
        { transaction },
      );
    });

    return await Promise.all(uploadPromises);
  }

  public async uploadMultipleFilesForBodega(
    {
      files,
      bodegaId,
      portadaFileName,
    }: {
      files: Express.Multer.File[];
      bodegaId: number;
      portadaFileName?: string | null;
    },
    transaction?: Transaction,
  ) {
    const uploadPromises = files.map(async (file) => {
      const { buffer, originalname, mimetype } = file;
      const parsedName = originalname.replace(/ /g, '_');
      const url = await this.storageService.createItem(
        parsedName + '-' + Date.now(),
        buffer,
        mimetype,
      );

      return MultimediaBodegas.create(
        {
          url,
          es_portada: portadaFileName === originalname ? new Date() : null,
          bodegaId,
        },
        { transaction },
      );
    });

    return await Promise.all(uploadPromises);
  }
}

export const multimediaService = new MultimediaService(storageService);
export type IMultimediaService = typeof multimediaService;
