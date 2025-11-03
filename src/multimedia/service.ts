import { IStorageService, storageService } from '@/storage/service';
import { MultimediaBodegas, MultimediaEventos } from './model';
import { Op, Transaction } from 'sequelize';

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

  public async updateMultimediaForEvento(
    {
      files,
      eventoId,
      portadaFileName,
      removeMultimediaIds,
    }: {
      files: Express.Multer.File[];
      eventoId: number;
      portadaFileName?: string | null;
      removeMultimediaIds?: number[];
    },
    transaction?: Transaction,
  ) {
    // Remove multimedia files if specified
    if (removeMultimediaIds && removeMultimediaIds.length > 0) {
      await MultimediaEventos.destroy({
        where: {
          id: { [Op.in]: removeMultimediaIds },
          eventoId,
        },
        transaction,
      });
    }

    // Upload new multimedia files if provided
    if (files && files.length > 0) {
      await this.uploadMultipleFilesForEvento(
        {
          files,
          eventoId,
          portadaFileName,
        },
        transaction,
      );
    }

    // Update portada if specified and no new files uploaded
    if (portadaFileName && (!files || files.length === 0)) {
      // Find existing multimedia with the specified filename
      const existingMultimedia = await MultimediaEventos.findOne({
        where: {
          eventoId,
          url: { [Op.like]: `%${portadaFileName}%` },
        },
        transaction,
      });

      if (existingMultimedia) {
        // Remove portada status from all multimedia for this evento
        await MultimediaEventos.update(
          { es_portada: null },
          {
            where: { eventoId },
            transaction,
          },
        );

        // Set the specified multimedia as portada
        await existingMultimedia.update(
          { es_portada: new Date() },
          { transaction },
        );
      }
    }
  }

  public async updateMultimediaForBodega(
    {
      files,
      bodegaId,
      portadaFileName,
      removeMultimediaIds,
    }: {
      files: Express.Multer.File[];
      bodegaId: number;
      portadaFileName?: string | null;
      removeMultimediaIds?: number[];
    },
    transaction?: Transaction,
  ) {
    // Remove multimedia files if specified
    if (removeMultimediaIds && removeMultimediaIds.length > 0) {
      await MultimediaBodegas.destroy({
        where: {
          id: { [Op.in]: removeMultimediaIds },
          bodegaId,
        },
        transaction,
      });
    }

    // Upload new multimedia files if provided
    if (files && files.length > 0) {
      await this.uploadMultipleFilesForBodega(
        {
          files,
          bodegaId,
          portadaFileName,
        },
        transaction,
      );
    }

    // Update portada if specified and no new files uploaded
    if (portadaFileName && (!files || files.length === 0)) {
      // Find existing multimedia with the specified filename
      const existingMultimedia = await MultimediaBodegas.findOne({
        where: {
          bodegaId,
          url: { [Op.like]: `%${portadaFileName}%` },
        },
        transaction,
      });

      if (existingMultimedia) {
        // Remove portada status from all multimedia for this bodega
        await MultimediaBodegas.update(
          { es_portada: null },
          {
            where: { bodegaId },
            transaction,
          },
        );

        // Set the specified multimedia as portada
        await existingMultimedia.update(
          { es_portada: new Date() },
          { transaction },
        );
      }
    }
  }
}

export const multimediaService = new MultimediaService(storageService);
export type IMultimediaService = typeof multimediaService;
