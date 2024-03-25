import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  async deleteFiles(folder: string, fileName: string) {
    try {
      fs.unlink(
        path.join(process.cwd(), '..', 'uploads', folder, fileName),
        (err) => {
          if (err) {
            return new InternalServerErrorException();
          }
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async saveFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      if (!file) {
        throw new HttpException('Fayl mavjud emas', HttpStatus.BAD_REQUEST);
      }
      const filename = uuidv4() + '.' + "jpeg";
      const filePath = path.join(
        process.cwd(),
        '..',
        'uploads',
        folder,
        filename,
      );
      this.saveFileToDisk(filePath, file.buffer);
      return filename;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async saveFileToDisk(
    filePath: string,
    fileBuffer: Buffer,
    quality: number = 100,
    width: number = 800,
    height: number = 500
  ) {
    return await sharp(fileBuffer).resize(width, height).jpeg({quality}).toFile(filePath)
  }

}
