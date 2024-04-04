import { Injectable, ConflictException, NotFoundException, InternalServerErrorException, UnauthorizedException, Body, BadRequestException, HttpException, HttpStatus } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Sign } from './dto/sign.dto';
import { RequestUser } from 'src/common/interface/req-user.interface';
import { Permission, Admin } from '@entities';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Admin)
        private readonly admins: Repository<Admin>,
        private readonly JwtService: JwtService
    ) {}

    async Sign(@Body() body: Sign){

      try {
        const admin = await this.admins.findOne({
            relations: {
                role: true,
                permissions: true
            },
            where: {
                adminname: body.adminname,
                password: body.password
            }
        })
        let permissions =  (await Permission.find()).map(el => el.path)
        let adminRole = admin.role.name
        delete admin.role
        if(admin) {
           const token = this.sign(admin.id)
            return {
                success: true,
                message: "Admin mavjud",
                data: {
                  token: token,
                  role: adminRole,
                  permissions: adminRole === "developer" || adminRole === "super_admin" ? permissions : admin.permissions ? admin.permissions.map(el => el.path) : []
                }
            }

        } else {
            throw new HttpException("admin topilmadi", HttpStatus.NOT_FOUND)
        }
      } catch (error) {
          throw new HttpException(error.message, error.status)
      }
    }


    sign(payload: string) {
       try {
        return this.JwtService.sign(payload, {
            secret: process.env.SECRET_KEY
        })
       } catch (error) {
          throw new HttpException(error.message, error.status)
       }
    }

    verify(payload: string) {
        try {
          return this.JwtService.verify(payload, {
            secret: process.env.SECRET_KEY
          });
        } catch(error) {
          throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
        }
      }

    async validateUser(id: string){
      try {
        const admin = await this.admins.findOne({
            where: {
                id
            },
            relations: {
                role: true
            }
        })

        if(!admin) {
            throw new HttpException("Admin topilmadi", HttpStatus.NOT_FOUND)
        } else {
          return admin
        }
      } catch (error) {
          throw new HttpException(error.message, error.status)
      }

    }

    async checkUserPermission(user_id: string, permissionPath: string) {
      try {
        let permission = await this.admins.createQueryBuilder("a")
          .leftJoinAndSelect("a.permissions", "p")
          .where("a.id = :user_id", { user_id })
          .andWhere("p.path = :path", { path: permissionPath })
          .getOne();

        return permission;
      } catch (error) {
        throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
      }
    }
}
