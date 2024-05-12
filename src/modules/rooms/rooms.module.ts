import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin, Room } from '@entities';
import { AuthService } from '../auth';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([Admin, Room])
  ],
  controllers: [RoomsController],
  providers: [RoomsService, AuthService]
})
export class RoomsModule {}
