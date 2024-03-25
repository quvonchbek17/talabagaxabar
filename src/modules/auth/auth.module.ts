import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([ Admin ]),
    JwtModule.register({
        secret: process.env.SECRET_KEY
    })],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
