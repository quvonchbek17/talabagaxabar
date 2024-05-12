import { Module } from '@nestjs/common';
import { SciencesService } from './sciences.service';
import { SciencesController } from './sciences.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin, Science } from '@entities';
import { AuthService } from '../auth';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([Admin, Science])
  ],
  controllers: [SciencesController],
  providers: [SciencesService, AuthService]
})
export class SciencesModule {}
