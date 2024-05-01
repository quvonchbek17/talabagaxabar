import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { UpdateDirectionDto } from './dto/update-direction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Direction, Admin } from '@entities';
import { Repository } from 'typeorm';
import { rolesName } from '@common';

@Injectable()
export class DirectionsService {
   constructor(
    @InjectRepository(Direction)
    private readonly directionRepo: Repository<Direction>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>
   ){}

   async create(body: CreateDirectionDto, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true },
      });
      let checkDuplicate = await this.directionRepo.findOne({
        where: { name: body.name, faculty: { id: admin.faculty.id } },
      });

      if (checkDuplicate) {
        throw new HttpException(
          "Bu kafedra avval qo'shilgan",
          HttpStatus.CONFLICT,
        );
      }
      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let direction = this.directionRepo.create({
        ...body,
        faculty: admin.faculty,
      });
      await direction.save();
      return {
        statusCode: HttpStatus.OK,
        message: 'Kafedra saqlandi',
        success: true,
        data: direction,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      if (admin.role?.name === rolesName.super_admin) {
        let directions = await this.directionRepo.find({
          relations: { faculty: true },
        });
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: directions,
        };
      }

      if (admin?.faculty) {
        let directions = await this.directionRepo.find({
          where: { faculty: { id: admin.faculty.id } },
        });
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: directions,
        };
      } else {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} direction`;
  }

  update(id: number, updateDirectionDto: UpdateDirectionDto) {
    return `This action updates a #${id} direction`;
  }

  remove(id: number) {
    return `This action removes a #${id} direction`;
  }
}
