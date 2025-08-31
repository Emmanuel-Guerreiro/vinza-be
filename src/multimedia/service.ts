import { IStorageService, storageService } from '@/storage/service';
import { CreateMultimediaFromFileSchema } from './schema';
import { MultimediaBodegas, MultimediaEventos } from './model';
import { MultimediaTargetEnum } from './enum';

export class MultimediaService {
  constructor(private readonly storageService: IStorageService) {}

  public async uploadFile(
    file: Express.Multer.File,
    dto: CreateMultimediaFromFileSchema,
  ) {
    const { buffer, originalname, mimetype } = file;
    const url = await this.storageService.createItem(
      originalname,
      buffer,
      mimetype,
    );

    let createdMultimedia: MultimediaBodegas | MultimediaEventos;
    switch (dto.multimediaTarget) {
      case MultimediaTargetEnum.BODEDEA:
        createdMultimedia = await MultimediaBodegas.create({
          url,
          tipo: dto.tipo,
        });
        break;
      case MultimediaTargetEnum.EVENTO:
        createdMultimedia = await MultimediaEventos.create({
          url,
          tipo: dto.tipo,
        });
        break;
    }

    return {
      ...createdMultimedia.dataValues,
      target: dto.multimediaTarget,
    };
  }
}

export const multimediaService = new MultimediaService(storageService);
export type IMultimediaService = typeof multimediaService;
