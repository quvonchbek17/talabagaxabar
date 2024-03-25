import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  import { REQUERED_ROLES } from 'src/common/decorators/set-roles.decorator';
import { AuthService } from '../auth.service';


declare module 'express' {
  interface Request {
    user: {
      id: string,
      role: string
    };
  }
}
  @Injectable()
  export class HasRole implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly authService: AuthService
        ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
          const request = context.switchToHttp().getRequest<Request>();
          const roles = this.reflector.getAllAndOverride<string[]>(REQUERED_ROLES, [
            context.getHandler(),
            context.getClass(),
          ]);

          let user = request["user"]
          const hasRole = roles.find((role) => role === user.role);

          if (!hasRole) {
            throw new HttpException('Ruxsatga ega emassiz', HttpStatus.FORBIDDEN);
          }

          return true;
        } catch (error) {
          throw new HttpException(error.message, HttpStatus.FORBIDDEN);
        }
    }
  }
