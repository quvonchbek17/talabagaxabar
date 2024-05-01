import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department, Admin } from '@entities';
import { DepartmentsService } from './departments.service';
import { AuthService } from '../auth/auth.service';
import { DepartmentsController } from './departments.controller';
import { JwtModule} from '@nestjs/jwt';


@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([Department, Admin])
  ],
  controllers: [DepartmentsController],
  providers: [DepartmentsService, AuthService]
})
export class DepartmentsModule {}
