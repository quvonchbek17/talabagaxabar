import { Module } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { UniversitiesController } from './universities.controller';
import { UniversitiesRepository } from 'src/entities/universities.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([UniversitiesRepository])
  ],
  controllers: [UniversitiesController],
  providers: [UniversitiesService]
})
export class UniversitiesModule {}
