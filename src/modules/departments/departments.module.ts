import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsRepository } from 'src/entities/departments.entity';
import { FacultiesRepository } from 'src/entities/faculties.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DepartmentsRepository, FacultiesRepository])
  ],
  controllers: [DepartmentsController],
  providers: [DepartmentsService]
})
export class DepartmentsModule {}
