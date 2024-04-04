import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { AuthService } from '@modules';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '@entities';

@Module({
  controllers: [FilesController],
  providers: [FilesService]
})
export class FilesModule {}
