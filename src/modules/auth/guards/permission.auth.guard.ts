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
  import { Request } from 'express';
  import { PERMISSION } from '@common';
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
  export class CheckPermission implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly authService: AuthService
        ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
          const request = context.switchToHttp().getRequest<Request>();
          let permission = this.reflector.getAllAndOverride<string[]>(PERMISSION, [
            context.getHandler(),
            context.getClass(),
          ]);
          let user = request["user"]
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          let validatePermission = permission.toString().replace(uuidRegex, ":id")

          let checkUserPermission = await this.authService.checkUserPermission(user.id, validatePermission)

          if(user.role === "developer" || user.role === "super_admin"){
            return true
          }
          
          if(!checkUserPermission){
            throw new HttpException('Ruxsatga ega emassiz', HttpStatus.FORBIDDEN);
          }

          return true;
        } catch (error) {
          throw new HttpException(error.message, HttpStatus.FORBIDDEN);
        }
    }
  }
