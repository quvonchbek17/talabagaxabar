import { Injectable, ConflictException, NotFoundException, InternalServerErrorException, UnauthorizedException, Body, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminsRepository } from 'src/entities/admins.entity';
import { JwtService } from '@nestjs/jwt';
import { Sign } from './dto/sign.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AdminsRepository)
        private readonly admins: Repository<AdminsRepository>,
        private readonly JwtService: JwtService
    ) {}

    async Sign(@Body() body: Sign){

        const admin = await this.admins.findOne({
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
                role: admin.role
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
        console.log(process.env.SECRET_KEY);

        try {
          return this.JwtService.verify(payload, {
            secret: process.env.SECRET_KEY
          });
        } catch(err) {
          console.error('Token Verification Error:', err);
          throw new BadRequestException({message: "Tokenda muammo bor", status: 400});
        }
      }

    async validateUser(id: string){

        const admin = await this.admins.findOne({
            where: {
                id
            }
        })

        if(!admin) {
            throw new NotFoundException({message: "Admin topilmadi", status: 404})
        } else {
          return admin
        }

    }
}
