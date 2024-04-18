import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Permission, Admin  } from '@entities';
import { PermissionsService } from "@modules"

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([ Admin, Permission ]),
    JwtModule.register({
        secret: process.env.SECRET_KEY
    })],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
