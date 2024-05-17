import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateFacultyDto, UpdateFacultyDto } from './dto';
import { Faculty, University, Admin } from '@entities';
import { rolesName } from '@common';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}
  async create(body: CreateFacultyDto, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { university: true },
      });

      if (!admin.university) {
        throw new HttpException(
          "Sizning universitetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let checkDuplicate = await this.facultyRepo.findOne({
        where: { name: body.name, university: { id: admin.university.id } },
      });

      if (checkDuplicate) {
        throw new HttpException(
          "Bu fakultet avval qo'shilgan",
          HttpStatus.CONFLICT,
        );
      }

      let faculty = this.facultyRepo.create({
        name: body.name,
        university: admin.university,
      });
      await faculty.save();
      return {
        statusCode: HttpStatus.OK,
        message: 'Fakultet saqlandi',
        success: true,
        data: faculty,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async get(search: string, page: number, limit: number, adminId: string) {
    try {
      page = page ? page : 1
      limit = limit ? limit : 10

      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { university: true, role: true },
      });

      let qb = this.facultyRepo.createQueryBuilder('f')
      if(search){
        qb.andWhere('f.name ILike :search', { search: `%${search}%` })
      }

      if (admin.role?.name === rolesName.super_admin) {
        qb.innerJoin('f.university', 'u')
        .select(['f.id', 'f.name', 'u.id', 'u.name'])
      } else {
        if (!admin.university) {
          throw new HttpException(
            "Sizning universitetingiz yo'q",
            HttpStatus.FORBIDDEN,
          );
        }

        qb.select(['f.id', 'f.name']).andWhere('f.university_id = :id', { id: admin.university.id })
      }

      let [faculties, count] = await qb
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
          items: faculties,
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
        relations: { university: true, role: true },
      });

      if (admin.role?.name === rolesName.super_admin) {
        let faculty = await this.facultyRepo.findOne({
          where: { id },
          relations: { university: true },
        });
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: faculty,
        };
      }

      if (!admin.university) {
        throw new HttpException(
          "Sizning universitetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }
      let faculty = await this.facultyRepo.findOne({
        where: { id, university: { id: admin.university.id } },
      });
      if (faculty) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: faculty,
        };
      } else {
        throw new HttpException(
          "Sizning universitetingizda bunday idlik fakultet yo'q",
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

  async update(id: string, body: UpdateFacultyDto, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { university: true },
      });

      if (!admin.university) {
        throw new HttpException(
          "Sizning universitetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let faculty = await this.facultyRepo.findOne({
        where: { id, university: { id: admin.university.id } },
        relations: { university: true },
      });

      if (!faculty) {
        throw new HttpException(
          'Bunday fakultet mavjud emas yoki siz uchun ruxst berilmagan',
          HttpStatus.NOT_FOUND,
        );
      }

      let checkDuplicate = await this.facultyRepo.createQueryBuilder('f')
      .innerJoin('f.university', 'u')
      .where('f.id != :facultyId AND f.name = :name AND u.id = :universityId',
       {facultyId: faculty.id, name: body.name, universityId: admin.university?.id })
      .getOne()

      if (checkDuplicate) {
        throw new HttpException(
          'Bu nomlik fakultet allaqachon mavjud',
          HttpStatus.CONFLICT,
        );
      }
      await this.facultyRepo.update(id, {
        name: body.name || faculty.name,
        updated_at: new Date(),
      });
      return {
        success: true,
        message: 'Yangilandi',
        statusCode: HttpStatus.OK,
        data: await this.facultyRepo.findOne({ where: { id } }),
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
        relations: { university: true },
      });

      if (!admin.university) {
        throw new HttpException(
          "Sizning universitetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let faculty = await this.facultyRepo.findOne({
        where: { id, university: {id: admin.university.id}}
      });

      if (faculty) {
        await this.facultyRepo.remove(faculty);
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: "O'chirildi",
        };
      } else {
        throw new HttpException(
          "Bunday fakultet yo'q",
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
