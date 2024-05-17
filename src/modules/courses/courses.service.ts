import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Admin, Course } from '@entities';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { rolesName } from '@common';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  async create(body: CreateCourseDto, adminId: string) {
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

      let checkDuplicate = await this.courseRepo.findOne({
        where: { name: body.name, faculty: { id: admin.faculty?.id } },
      });

      if (checkDuplicate) {
        throw new HttpException(
          "Bu kurs avval qo'shilgan",
          HttpStatus.CONFLICT,
        );
      }

      let course = this.courseRepo.create({
        name: body.name,
        faculty: admin.faculty,
      });
      await course.save();
      return {
        statusCode: HttpStatus.OK,
        message: 'Kurs saqlandi',
        success: true,
        data: course,
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

      let qb = this.courseRepo.createQueryBuilder('c')
      if(search){
        qb.andWhere('c.name ILike :search', { search: `%${search}%` })
      }

      if (admin.role?.name === rolesName.super_admin) {
        qb.innerJoin('c.faculty', 'f')
        .select(['c.id', 'c.name', 'f.id', 'f.name'])

        if(faculty_id){
          qb.andWhere('f.id = :facultyId', { facultyId: faculty_id })
        }
      } else {
        if (!admin.faculty) {
          throw new HttpException(
            "Sizning fakultetingiz yo'q",
            HttpStatus.FORBIDDEN,
          );
        }

        qb.select(['c.id', 'c.name'])
        .andWhere('c.faculty_id = :id', { id: admin.faculty.id })
      }

      let [courses, count] = await qb
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
          items: courses,
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
        let course = await this.courseRepo.findOne({
          where: { id },
          relations: { faculty: true },
        });
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: course,
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }
      let course = await this.courseRepo.findOne({
        where: { id, faculty: { id: admin.faculty.id } },
      });
      if (course) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: course,
        };
      } else {
        throw new HttpException(
          "Sizning fakultetingizda bunday idlik kurs yo'q",
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

  async update(id: string, body: UpdateCourseDto, adminId: string) {
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

      let course = await this.courseRepo.findOne({
        where: { id, faculty: { id: admin.faculty?.id } },
        relations: { faculty: true },
      });

      if (!course) {
        throw new HttpException(
          'Bunday kurs mavjud emas yoki siz uchun ruxsat berilmagan',
          HttpStatus.NOT_FOUND,
        );
      }

      let checkDuplicate = await this.courseRepo.createQueryBuilder('c')
      .innerJoin('c.faculty', 'f')
      .where('c.id != :courseId AND c.name = :name AND f.id = :facultyId',
       {courseId: course.id, name: body.name, facultyId: admin.faculty?.id })
      .getOne()

      if (checkDuplicate) {
        throw new HttpException(
          'Bu nomlik kurs allaqachon mavjud',
          HttpStatus.CONFLICT,
        );
      }
      await this.courseRepo.update(id, {
        name: body.name || course.name,
        updated_at: new Date(),
      });
      return {
        success: true,
        message: 'Yangilandi',
        statusCode: HttpStatus.OK,
        data: await this.courseRepo.findOne({ where: { id } }),
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

      let course = await this.courseRepo.findOne({
        where: { id, faculty: {id: admin.faculty?.id}}
      });

      if (course) {
        await this.courseRepo.remove(course);
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: "O'chirildi",
        };
      } else {
        throw new HttpException(
          "Bunday kurs yo'q",
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
