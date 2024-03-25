import { Injectable, ConflictException, NotFoundException, InternalServerErrorException, UnauthorizedException, Body, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from 'src/entities/admin.entity';
import { JwtService } from '@nestjs/jwt';
import { Sign } from './dto/sign.dto';
import { RequestUser } from 'src/common/interface/req-user.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Admin)
        private readonly admins: Repository<Admin>,
        private readonly JwtService: JwtService
    ) {}

    async Sign(@Body() body: Sign){

        const admin = await this.admins.findOne({
            relations: {
                role: true
            },
            where: {
                adminname: body.adminname,
                password: body.password
            }
        })

        if(admin) {
            const token = this.sign(admin.id)
            return {
                success: true,
                message: "Admin mavjud",
                token: token,
                role: admin.role.name
            }

        } else {
            throw new NotFoundException({message: "Admin topilmadi", status: 404})
        }
    }


    sign(payload: string) {
        return this.JwtService.sign(payload, {
            secret: process.env.SECRET_KEY
        })
    }

    verify(payload: string) {
        try {
          return this.JwtService.verify(payload, {
            secret: process.env.SECRET_KEY
          });
        } catch(err) {
          throw new BadRequestException({message: "Tokenda muammo bor", status: 400});
        }
      }

    async validateUser(id: string){
        const admin = await this.admins.findOne({
            where: {
                id
            },
            relations: {
                role: true
            }
        })

        if(!admin) {
            throw new NotFoundException({message: "Admin topilmadi", status: 404})
        } else {
          return admin
        }

    }
}
