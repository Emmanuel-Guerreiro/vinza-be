import { Router } from 'express';
import { MultimediaController } from './controller';
import { multimediaService } from './service';
import multer from 'multer';
const upload = multer();

const controller = new MultimediaController(multimediaService);
const router = Router();

router.post('/upload', upload.single('file'), controller.uploadFile);

export default router;
