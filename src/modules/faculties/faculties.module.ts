import { Module } from '@nestjs/common';
import { FacultiesService } from './faculties.service';
import { FacultiesController } from './faculties.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from 'src/entities/faculty.entity';
import { University } from 'src/entities/university.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Faculty, University])],
  controllers: [FacultiesController],
  providers: [FacultiesService]
})
export class FacultiesModule {}
