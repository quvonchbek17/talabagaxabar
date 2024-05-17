import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin, Group, Room, Schedule, Science, Teacher, Time } from '@entities';
import { AuthService } from '../auth';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([Schedule, Admin, Science, Teacher, Time, Room, Group])
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService, AuthService]
})
export class SchedulesModule {}
