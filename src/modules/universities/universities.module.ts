import { Module } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { UniversitiesController } from './universities.controller';
import { University } from 'src/entities/university.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { Admin } from 'src/entities/admin.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([University, Admin])
  ],
  controllers: [UniversitiesController],
  providers: [UniversitiesService, AuthService]
})
export class UniversitiesModule {}
