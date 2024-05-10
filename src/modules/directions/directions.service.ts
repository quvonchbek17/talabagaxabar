import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Direction, Admin } from '@entities';
import { rolesName } from '@common';
import { CreateDirectionDto, UpdateDirectionDto } from './dto';

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
          "Bu yo'nalish avval qo'shilgan",
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

      delete direction.faculty.created_at
      delete direction.faculty.updated_at
      return {
        statusCode: HttpStatus.OK,
        message: "Yo'nalish saqlandi",
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
      let page = 1
      let limit = 10

      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      if (admin.role?.name === rolesName.super_admin) {
        let [directions, count] = await this.directionRepo
        .createQueryBuilder('d')
        .innerJoin('d.faculty', 'f')
        .select(['d.id', 'd.name', 'f.id', 'f.name'])
        .offset((page - 1) * limit)
        .limit(limit)
        .getManyAndCount();

      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'success',
        data: {
          currentPage: page,
          currentCount: limit,
          totalCount: count,
          totalPages: Math.ceil(count / limit),
          items: directions,
        },
      };
      }

      if (admin?.faculty) {
        let [directions, count] = await this.directionRepo
        .createQueryBuilder('d')
        .select(['d.id', 'd.name'])
        .offset((page - 1) * limit)
        .limit(limit)
        .where('d.faculty_id = :id', { id: admin.faculty.id })
        .getManyAndCount();
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'success',
        data: {
          currentPage: page,
          currentCount: limit,
          totalCount: count,
          totalPages: Math.ceil(count / limit),
          items: directions,
        },
      }
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

  async pagination(page: number, limit: number, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      if (admin.role.name === rolesName.super_admin) {
        let [directions, count] = await this.directionRepo
          .createQueryBuilder('d')
          .innerJoin('d.faculty', 'f')
          .select(['d.id', 'd.name', 'f.id', 'f.name'])
          .offset((page - 1) * limit)
          .limit(limit)
          .getManyAndCount();

        return {
          statusCode: HttpStatus.OK,
          success: true,
          message: 'success',
          data: {
            currentPage: page,
            currentCount: limit,
            totalCount: count,
            totalPages: Math.ceil(count / limit),
            items: directions,
          },
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let [directions, count] = await this.directionRepo
        .createQueryBuilder('d')
        .select(['d.id', 'd.name'])
        .offset((page - 1) * limit)
        .limit(limit)
        .where('d.faculty_id = :id', { id: admin.faculty.id })
        .getManyAndCount();
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'success',
        data: {
          currentPage: page,
          currentCount: limit,
          totalCount: count,
          totalPages: Math.ceil(count / limit),
          items: directions,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }


  async search(search: string, page: number, limit: number, adminId: string) {
    try {
      page = page ? page : 1
      limit = limit ? limit : 10


      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      if (admin.role?.name === rolesName.super_admin) {
      let [directions, count] = await this.directionRepo
      .createQueryBuilder('d')
      .innerJoin('d.faculty', 'f')
      .select(['d.id', 'd.name', 'f.id', 'f.name'])
      .offset((page - 1) * limit)
      .limit(limit)
      .where('d.name ILike :search', { search: `%${search}%` })
      .getManyAndCount();
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'success',
        data: {
          currentPage: page,
          currentCount: limit,
          totalCount: count,
          totalPages: Math.ceil(count / limit),
          items: directions,
        },
      };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let [directions, count] = await this.directionRepo
      .createQueryBuilder('d')
      .select(['d.id', 'd.name'])
      .offset((page - 1) * limit)
      .limit(limit)
      .where('d.faculty_id = :id', { id: admin.faculty.id })
      .andWhere('d.name ILike :search', { search: `%${search}%` })
      .getManyAndCount();
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'success',
        data: {
          currentPage: page,
          currentCount: limit,
          totalCount: count,
          totalPages: Math.ceil(count / limit),
          items: directions,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }


  async findOne(id: string, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      if (admin.role?.name === rolesName.super_admin) {
        let direction = await this.directionRepo.findOne({
          where: { id },
          relations: { faculty: true },
        });
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: direction,
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }
      let direction = await this.directionRepo.findOne({
        where: { id, faculty: { id: admin.faculty.id } },
      });
      if (direction) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: direction,
        };
      } else {
        throw new HttpException(
          "Sizning fakultetingizda bunday idlik yo'nalish yo'q",
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, body: UpdateDirectionDto, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true },
      });

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let direction = await this.directionRepo.findOne({
        where: { id, faculty: { id: admin.faculty.id } },
        relations: { faculty: true },
      });

      if (!direction) {
        throw new HttpException(
          "Bunday yo'nalish mavjud emas yoki siz uchun ruxsat berilmagan",
          HttpStatus.NOT_FOUND,
        );
      }

      let checkDuplicate = await this.directionRepo.findOne({
        where: { name: body.name, faculty: { id: admin.faculty.id } },
        relations: { faculty: true },
      });

      if (checkDuplicate) {
        throw new HttpException(
          "Bu nomlik yo'nalish allaqachon mavjud",
          HttpStatus.CONFLICT,
        );
      }
      await this.directionRepo.update(id, {
        name: body.name,
        updated_at: new Date(),
      });
      return {
        success: true,
        message: 'Yangilandi',
        statusCode: HttpStatus.OK,
        data: await this.directionRepo.findOne({ where: { id } }),
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true },
      });

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let direction = await this.directionRepo.findOne({
        where: { id, faculty: {id: admin.faculty.id}}
      });

      if (direction) {
        await this.directionRepo.remove(direction);
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: "O'chirildi",
        };
      } else {
        throw new HttpException(
          "Bunday yo'nalish yo'q",
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
