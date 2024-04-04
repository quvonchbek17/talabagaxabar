import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './ormconfig/typeorm.config';
import { config } from './config';
import { UniversitiesModule } from './modules/universities/universities.module';
import { FacultiesModule } from './modules/faculties/faculties.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { DirectionsModule } from './modules/directions/directions.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './modules/auth/auth.service';
import { AdminsModule } from './modules/admins/admins.module';
import { FilesModule } from './modules/files/files.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import {
  Admin,
  AdminRole,
  BaseModel,
  BotUser,
  BotAdmin,
  Course,
  Department,
  Direction,
  Education,
  Faculty,
  Group,
  Location,
  Permission,
  Room,
  Science,
  Teacher,
  University,
} from '@entities';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET_KEY,
    }),
    ConfigModule.forRoot(config),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    TypeOrmModule.forFeature([
      Admin,
      AdminRole,
      BaseModel,
      BotUser,
      BotAdmin,
      Course,
      Department,
      Direction,
      Education,
      Faculty,
      Group,
      Location,
      Permission,
      Room,
      Science,
      Teacher,
      University,
    ]),
    FacultiesModule,
    AuthModule,
    DepartmentsModule,
    DirectionsModule,
    AdminsModule,
    UniversitiesModule,
    FilesModule,
    PermissionsModule,
  ],
})
export class AppModule {}
