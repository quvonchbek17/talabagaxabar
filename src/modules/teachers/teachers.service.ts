import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, Department, Science, Teacher } from '@entities';
import { ILike, Repository } from 'typeorm';
import { rolesName } from '@common';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    readonly teacherRepo: Repository<Teacher>,
    @InjectRepository(Admin)
    readonly adminRepo: Repository<Admin>,
    @InjectRepository(Department)
    readonly departmentRepo: Repository<Department>,
    @InjectRepository(Science)
    readonly scienceRepo: Repository<Science>,
  ) {}
  async create(body: CreateTeacherDto, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true },
      });
      let checkDuplicate = await this.teacherRepo.findOne({
        where: {
          name: body.name,
          surname: body.surname,
          department: { id: body.department_id },
          faculty: { id: admin.faculty.id },
        },
      });

      if (checkDuplicate) {
        throw new HttpException(
          "Bu o'qituvchi avval qo'shilgan",
          HttpStatus.CONFLICT,
        );
      }
      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let department = await this.departmentRepo.findOne({
        where: {
          id: body.department_id,
          faculty: { id: admin.faculty.id },
        },
      });

      if (!department) {
        throw new HttpException(
          'Bunday idlik kafedra mavjud emas',
          HttpStatus.BAD_REQUEST,
        );
      }

      let { nonExistingScienceIds, existingSciences } =
        await this.checkExistingSciences(body?.sciences);
      if (nonExistingScienceIds.length > 0) {
        throw new HttpException(
          `${nonExistingScienceIds.join(', ')} idlik fanlar mavjud emas`,
          HttpStatus.BAD_REQUEST,
        );
      }

      let teacher = this.teacherRepo.create({
        name: body.name,
        surname: body.surname,
        department: department,
        sciences: existingSciences,
        faculty: admin.faculty,
      });
      await teacher.save();

      delete teacher.faculty.created_at;
      delete teacher.faculty.updated_at;
      delete teacher.department.created_at;
      delete teacher.department.updated_at;

      return {
        statusCode: HttpStatus.OK,
        message: "O'qituvch saqlandi",
        success: true,
        data: teacher,
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
      let page = 1;
      let limit = 10;
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      if (admin.role?.name === rolesName.super_admin) {
        let [teachers, count] = await this.teacherRepo
          .createQueryBuilder('t')
          .innerJoin('t.department', 'd')
          .innerJoin('t.faculty', 'f')
          .leftJoinAndSelect('t.sciences', 's')
          .select([
            't.id',
            't.name',
            't.surname',
            'f.id',
            'f.name',
            'd.id',
            'd.name',
            's.id',
            's.name',
          ])
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
            items: teachers,
          },
        };
      }

      if (admin?.faculty) {
        let [teachers, count] = await this.teacherRepo
          .createQueryBuilder('t')
          .leftJoinAndSelect('t.department', 'd')
          .leftJoinAndSelect('t.sciences', 's')
          .select([
            't.id',
            't.name',
            't.surname',
            'd.id',
            'd.name',
            's.id',
            's.name',
          ])
          .offset((page - 1) * limit)
          .limit(limit)
          .where('t.faculty_id = :id', { id: admin.faculty.id })
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
            items: teachers,
          },
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

  async pagination(page: number, limit: number, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      if (admin.role?.name === rolesName.super_admin) {
        let [teachers, count] = await this.teacherRepo
          .createQueryBuilder('t')
          .innerJoin('t.department', 'd')
          .innerJoin('t.faculty', 'f')
          .leftJoinAndSelect('t.sciences', 's')
          .select([
            't.id',
            't.name',
            't.surname',
            'f.id',
            'f.name',
            'd.id',
            'd.name',
            's.id',
            's.name',
          ])
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
            items: teachers,
          },
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let [teachers, count] = await this.teacherRepo
        .createQueryBuilder('t')
        .leftJoinAndSelect('t.department', 'd')
        .leftJoinAndSelect('t.sciences', 's')
        .select([
          't.id',
          't.name',
          't.surname',
          'd.id',
          'd.name',
          's.id',
          's.name',
        ])
        .offset((page - 1) * limit)
        .limit(limit)
        .where('t.faculty_id = :id', { id: admin.faculty.id })
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
          items: teachers,
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
      page = page ? page : 1;
      limit = limit ? limit : 10;

      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      if (admin.role?.name === rolesName.super_admin) {
        let [teachers, count] = await this.teacherRepo
          .createQueryBuilder('t')
          .innerJoin('t.department', 'd')
          .innerJoin('t.faculty', 'f')
          .leftJoinAndSelect('t.sciences', 's')
          .select([
            't.id',
            't.name',
            't.surname',
            'f.id',
            'f.name',
            'd.id',
            'd.name',
            's.id',
            's.name',
          ])
          .offset((page - 1) * limit)
          .limit(limit)
          .where('t.name = :search OR t.surname = :search', {
            search: `%${search}%`,
          })
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
            items: teachers,
          },
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let [teachers, count] = await this.teacherRepo
        .createQueryBuilder('t')
        .leftJoinAndSelect('t.department', 'd')
        .leftJoinAndSelect('t.sciences', 's')
        .select([
          't.id',
          't.name',
          't.surname',
          'd.id',
          'd.name',
          's.id',
          's.name',
        ])
        .offset((page - 1) * limit)
        .limit(limit)
        .where('t.faculty_id = :id', { id: admin.faculty.id })
        .andWhere('t.name = :search OR t.surname = :search', {
          search: `%${search}%`,
        })
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
          items: teachers,
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
        let teacher = await this.teacherRepo.findOne({
          where: { id },
          relations: { department: true, faculty: true },
        });
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: teacher,
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }
      let teacher = await this.teacherRepo.findOne({
        where: { id, faculty: { id: admin.faculty?.id } },
        relations: { department: true },
      });
      if (teacher) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: teacher,
        };
      } else {
        throw new HttpException(
          "Sizning fakultetingizda bunday idlik o'qituvchi yo'q",
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

  async update(id: string, body: UpdateTeacherDto, adminId: string) {
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

      let teacher = await this.teacherRepo.findOne({
        where: { id, faculty: { id: admin.faculty?.id } },
        relations: { faculty: true },
      });

      if (!teacher) {
        throw new HttpException(
          "Bunday o'qituvchi mavjud emas yoki siz uchun ruxsat berilmagan",
          HttpStatus.NOT_FOUND,
        );
      }

      let department = await this.departmentRepo.findOne({
        where: { id: body.department_id, faculty: { id: admin.faculty?.id } },
      });

      if (!department && body.department_id) {
        throw new HttpException(
          'Bunday kafedra mavjud emas',
          HttpStatus.NOT_FOUND,
        );
      }

      let checkDuplicate = await this.teacherRepo.findOne({
        where: {
          name: body.name,
          surname: body.surname,
          department: {
            id: body.department_id
              ? body.department_id
              : teacher.department?.id,
          },
          faculty: { id: admin.faculty?.id },
        },
        relations: { faculty: true },
      });

      if (checkDuplicate) {
        throw new HttpException(
          "Bu o'qituvchi allaqachon mavjud",
          HttpStatus.CONFLICT,
        );
      }

      let { nonExistingScienceIds, existingSciences } =
        await this.checkExistingSciences(body?.sciences);
      if (nonExistingScienceIds.length > 0) {
        throw new HttpException(
          `${nonExistingScienceIds.join(', ')} idlik fanlar mavjud emas`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (existingSciences.length > 0) {
        teacher.sciences = existingSciences;
      }

      teacher.name = body.name || teacher.name;
      teacher.surname = body.surname || teacher.surname;
      teacher.department = department || teacher.department;
      teacher.updated_at = new Date();

      await this.teacherRepo.save(teacher);
      return {
        success: true,
        message: 'Yangilandi',
        statusCode: HttpStatus.OK,
        data: await this.teacherRepo.findOne({
          where: { id },
          relations: { department: true, sciences: true },
        }),
      };
    } catch (error) {
      console.log(error);

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

      let teacher = await this.teacherRepo.findOne({
        where: { id, faculty: { id: admin.faculty.id } },
      });

      if (teacher) {
        await this.teacherRepo.remove(teacher);
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: "O'chirildi",
        };
      } else {
        throw new HttpException("Bunday o'qituvchi yo'q", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkExistingSciences(
    scienceIds: string[],
  ): Promise<{ nonExistingScienceIds: string[]; existingSciences: Science[] }> {
    const nonExistingScienceIds: string[] = [];
    const existingSciences: Science[] = [];
    for (const scienceId of scienceIds) {
      const science = await this.scienceRepo.findOne({
        where: { id: scienceId },
      });
      if (!science) {
        nonExistingScienceIds.push(scienceId);
      } else {
        existingSciences.push(science);
      }
    }
    return { nonExistingScienceIds, existingSciences };
  }
}
