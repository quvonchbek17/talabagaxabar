import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectionsService } from './directions.service';
import { DirectionsController } from './directions.controller';
import { AuthService } from '../auth';
import { Admin, Direction } from '@entities';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([Admin, Direction])
  ],
  controllers: [DirectionsController],
  providers: [DirectionsService, AuthService]
})
export class DirectionsModule {}
