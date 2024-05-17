import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateEducationDto, UpdateEducationDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, Education } from '@entities';
import { Repository } from 'typeorm';
import { rolesName } from '@common';

@Injectable()
export class EducationsService {
  constructor(
    @InjectRepository(Education)
    private readonly educationRepo: Repository<Education>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  async create(body: CreateEducationDto, adminId: string) {
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

      let checkDuplicate = await this.educationRepo.findOne({
        where: { name: body.name, faculty: { id: admin.faculty?.id } },
      });

      if (checkDuplicate) {
        throw new HttpException(
          "Bu ta'lim turi avval qo'shilgan",
          HttpStatus.CONFLICT,
        );
      }

      let education = this.educationRepo.create({
        ...body,
        faculty: admin.faculty,
      });
      await education.save();
      return {
        statusCode: HttpStatus.OK,
        message: "Ta'lim turi saqlandi",
        success: true,
        data: education,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async get(search: string, faculty_id: string, page: number, limit: number, adminId: string) {
    try {
      page = page ? page : 1
      limit = limit ? limit : 10

      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      let qb = this.educationRepo.createQueryBuilder('e')
      if(search){
        qb.where('e.name ILike :search', { search: `%${search}%` })
      }

      if (admin.role?.name === rolesName.super_admin) {
        qb.innerJoin('e.faculty', 'f')
        .select(['e.id', 'e.name', 'f.id', 'f.name'])

        if(faculty_id){
          qb.where('f.id = :facultyId', { facultyId: faculty_id })
        }
      } else {
        if (!admin.faculty) {
          throw new HttpException(
            "Sizning fakultetingiz yo'q",
            HttpStatus.FORBIDDEN,
          );
        }

        qb.select(['e.id', 'e.name'])
        .andWhere('e.faculty_id = :id', { id: admin.faculty?.id })
      }

      let [educations, count] = await qb
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
          items: educations,
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
        let education = await this.educationRepo.findOne({
          where: { id },
          relations: { faculty: true },
        });
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: education,
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }
      let education = await this.educationRepo.findOne({
        where: { id, faculty: { id: admin.faculty.id } },
      });
      if (education) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: education,
        };
      } else {
        throw new HttpException(
          "Sizning fakultetingizda bunday idlik ta'lim turi yo'q",
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

  async update(id: string, body: UpdateEducationDto, adminId: string) {
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

      let education = await this.educationRepo.findOne({
        where: { id, faculty: { id: admin.faculty.id } },
        relations: { faculty: true },
      });

      if (!education) {
        throw new HttpException(
          "Bunday ta'lim turi mavjud emas yoki siz uchun ruxsat berilmagan",
          HttpStatus.NOT_FOUND,
        );
      }

      let checkDuplicate = await this.educationRepo.createQueryBuilder('e')
      .innerJoin('e.faculty', 'f')
      .where('e.id != :educationId AND e.name = :name AND f.id = :facultyId',
       {educationId: education.id, name: body.name, facultyId: admin.faculty?.id })
      .getOne()

      if (checkDuplicate) {
        throw new HttpException(
          "Bu nomlik ta'lim turi allaqachon mavjud",
          HttpStatus.CONFLICT,
        );
      }
      await this.educationRepo.update(id, {
        name: body.name || education.name,
        updated_at: new Date(),
      });
      return {
        success: true,
        message: 'Yangilandi',
        statusCode: HttpStatus.OK,
        data: await this.educationRepo.findOne({ where: { id } }),
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

      let education = await this.educationRepo.findOne({
        where: { id, faculty: {id: admin.faculty.id}}
      });

      if (education) {
        await this.educationRepo.remove(education);
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: "O'chirildi",
        };
      } else {
        throw new HttpException(
          "Bunday ta'lim turi yo'q",
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
