import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission, Admin } from '@entities';
import {AuthService} from "@modules"
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([Permission, Admin])
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, AuthService]
})
export class PermissionsModule {}
