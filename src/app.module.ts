import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager'
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './ormconfig/typeorm.config';
import { config } from './config';
import { UniversitiesModule } from './modules/universities/universities.module';
import { FacultiesModule } from './modules/faculties/faculties.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { DirectionsModule } from './modules/directions/directions.module';
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
import { TeachersModule } from './modules/teachers/teachers.module';
import { SciencesModule } from './modules/sciences/sciences.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { EducationsModule } from './modules/educations/educations.module';
import { CoursesModule } from './modules/courses/courses.module';
import { GroupsModule } from './modules/groups/groups.module';
import { TimesModule } from './modules/times/times.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET_KEY,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 1000*60*30
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
    TeachersModule,
    SciencesModule,
    RoomsModule,
    EducationsModule,
    CoursesModule,
    GroupsModule,
    TimesModule,
    SchedulesModule
  ],
})
export class AppModule {}
