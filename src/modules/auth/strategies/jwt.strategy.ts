import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

declare global {
  interface Request {
    userId: string;
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_KEY,
      pass: true,
      passReqToCallback: true
    });
  }

  async validate(req: Request, payload: string) {
    try {
      await this.authService.validateUser(payload);
      req.userId = payload
      return { payload };
    } catch (error) {
      throw new UnauthorizedException();

    }
  }
}
