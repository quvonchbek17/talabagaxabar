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
      let filePath = path.join(process.cwd(), '..', 'uploads', folder, fileName || "rasm")
      if(fs.existsSync(filePath)){
        fs.unlink(
          path.join(process.cwd(), '..', 'uploads', folder, fileName),
          (err) => {
            if (err) {
              throw new HttpException("file yuklashda nimadir xato ketdi. Qaytadan urining", HttpStatus.INTERNAL_SERVER_ERROR);
            }
          },
        );
      }

    } catch (error) {
      return new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
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
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  private async saveFileToDisk(
    filePath: string,
    fileBuffer: Buffer,
    quality: number = 100
  ) {
    try {
      return await sharp(fileBuffer).jpeg({quality}).toFile(filePath)
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

}
