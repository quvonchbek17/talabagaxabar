import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  // async validate(id: string) {
  //   const user = await this.authService.validateUser(id);

  //   if (!user) {
  //     throw new UnauthorizedException();
  //   }
  //   return user;
  // }
}