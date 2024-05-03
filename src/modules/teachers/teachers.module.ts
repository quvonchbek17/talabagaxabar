import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin, Department, Teacher } from '@entities';
import { AuthService } from '../auth';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([Teacher, Admin, Department])
  ],
  controllers: [TeachersController],
  providers: [TeachersService, AuthService]
})
export class TeachersModule {}
