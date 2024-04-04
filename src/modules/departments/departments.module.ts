import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from 'src/entities/department.entity';
import { Faculty } from 'src/entities/faculty.entity';
import { AuthService } from '../auth/auth.service';
import { Admin } from 'src/entities/admin.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Permission } from '@entities';


@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([Department, Faculty, Admin])
  ],
  controllers: [DepartmentsController],
  providers: [DepartmentsService, AuthService]
})
export class DepartmentsModule {}
