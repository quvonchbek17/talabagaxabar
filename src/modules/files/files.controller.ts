import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FilesService } from './files.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('/:folder/:filename')
  async GetFile(@Param("filename") filename: string, @Param("folder") folder: string, @Res() res) {
    const filePath = path.join(process.cwd(), "..", "uploads", folder, filename);

    try {
      fs.accessSync(filePath);

      return res.sendFile(filename, { root: path.join(process.cwd(), "..", "uploads", folder) });
    } catch (error) {
      throw new NotFoundException("Bu fayl mavjud emas");
    }
  }
}
