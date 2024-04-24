import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { University, AdminRole, Admin } from '@entities';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { AuthService } from '../auth/auth.service';
import { FilesService } from '../files/files.service';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([ Admin, University, AdminRole ])
  ],
  controllers: [AdminsController],
  providers: [AdminsService, AuthService, FilesService]
})
export class AdminsModule {}
