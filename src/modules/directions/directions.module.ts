import { Module } from '@nestjs/common';
import { DirectionsService } from './directions.service';
import { DirectionsController } from './directions.controller';
import { AuthService } from '../auth';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '@entities';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([Admin])
  ],
  controllers: [DirectionsController],
  providers: [DirectionsService, AuthService]
})
export class DirectionsModule {}
