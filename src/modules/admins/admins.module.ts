import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { University } from 'src/entities/university.entity';
import { AdminRole } from 'src/entities/adminrole.entity';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([ Admin, University, AdminRole ])
  ],
  controllers: [AdminsController],
  providers: [AdminsService, AuthService]
})
export class AdminsModule {}
