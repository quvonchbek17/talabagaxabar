import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './ormconfig/typeorm.config';
import { config } from './config';
import { UniversitiesModule } from './modules/universities/universities.module';
import { FacultiesModule } from './modules/faculties/faculties.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { DirectionsModule } from './modules/directions/directions.module';

@Module({
  imports: [
    ConfigModule.forRoot(config),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    UniversitiesModule,
    FacultiesModule,
    AuthModule,
    DepartmentsModule,
    DirectionsModule,
  ]
})
export class AppModule {}
