import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin, Course, Direction, Education, Group } from '@entities';
import { AuthService } from '../auth';

@Module({
  imports: [
     JwtModule,
     TypeOrmModule.forFeature([Group, Admin, Direction, Course, Education])
  ],
  controllers: [GroupsController],
  providers: [GroupsService, AuthService]
})
export class GroupsModule {}
