import { Module } from '@nestjs/common';
import { FacultiesService } from './faculties.service';
import { FacultiesController } from './faculties.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultiesRepository } from 'src/entities/faculties.entity';
import { UniversitiesRepository } from 'src/entities/universities.entity';

@Module({
  imports:[TypeOrmModule.forFeature([FacultiesRepository, UniversitiesRepository])],
  controllers: [FacultiesController],
  providers: [FacultiesService]
})
export class FacultiesModule {}
