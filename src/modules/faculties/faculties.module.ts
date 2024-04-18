import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { University, Faculty, Admin } from '@entities';
import { FacultiesService } from './faculties.service';
import { FacultiesController } from './faculties.controller';
import { AuthModule, AuthService } from '@modules';

@Module({
  imports:[
    JwtModule,
    TypeOrmModule.forFeature([Faculty, University, Admin])
  ],
  controllers: [FacultiesController],
  providers: [FacultiesService, AuthService]
})
export class FacultiesModule {}
