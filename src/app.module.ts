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
import { Admin } from './entities/admin.entity';
import { FilesModule } from './modules/files/files.module';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET_KEY,
    }),
    ConfigModule.forRoot(config),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    FacultiesModule,
    AuthModule,
    DepartmentsModule,
    DirectionsModule,
    AdminsModule,
    UniversitiesModule,
    FilesModule
  ]
})
export class AppModule {}
