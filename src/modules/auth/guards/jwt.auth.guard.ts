import {
    CanActivate,
    ExecutionContext,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Request } from 'express';
import { AuthService } from '../auth.service';

  @Injectable()
  export class JwtAuthGuard implements CanActivate {
    constructor(private authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);


      if (!token) {
        throw new UnauthorizedException();
      }
      try {
        const userId = await this.authService.verify(token)
        let user = await this.authService.validateUser(userId)
        request['user'] = {id: userId, role: user?.role?.name};
      } catch (error){
        throw new InternalServerErrorException(error.message);
      }
      return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }