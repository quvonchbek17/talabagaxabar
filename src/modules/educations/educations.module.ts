import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Education, Admin } from '@entities';
import { AuthService } from '../auth';
import { EducationsService } from './educations.service';
import { EducationsController } from './educations.controller';

@Module({
  imports: [JwtModule, TypeOrmModule.forFeature([Education, Admin])],
  controllers: [EducationsController],
  providers: [EducationsService, AuthService],
})
export class EducationsModule {}
