import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, Department, Teacher } from '@entities';
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

      let teacher = this.teacherRepo.create({
        name: body.name,
        surname: body.surname,
        department: department,
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
      let page = 1
      let limit = 10
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      if (admin.role?.name === rolesName.super_admin) {
        let [teachers, count] = await this.teacherRepo
          .createQueryBuilder('t')
          .innerJoin('t.department', 'd')
          .innerJoin('t.faculty', 'f')
          .select([
            't.id',
            't.name',
            't.surname',
            'f.id',
            'f.name',
            'd.id',
            'd.name',
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
        .select(['t.id', 't.name', 't.surname'])
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
          .select([
            't.id',
            't.name',
            't.surname',
            'f.id',
            'f.name',
            'd.id',
            'd.name',
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
        .select(['t.id', 't.name', 't.surname'])
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
          .select([
            't.id',
            't.name',
            't.surname',
            'f.id',
            'f.name',
            'd.id',
            'd.name',
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
        .select(['t.id', 't.name', 't.surname'])
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
        where: { id: body.department_id, faculty: { id: admin.faculty?.id } }
      });

      console.log(department);


      if (!department && body.department_id) {
        throw new HttpException(
          "Bunday kafedra mavjud emas",
          HttpStatus.NOT_FOUND,
        );
      }

      let checkDuplicate = await this.teacherRepo.findOne({
        where: { name: body.name, surname: body.surname, department: {id: body.department_id ? body.department_id : teacher.department?.id}, faculty: { id: admin.faculty?.id } },
        relations: { faculty: true },
      });

      if (checkDuplicate) {
        throw new HttpException(
          "Bu o'qituvchi allaqachon mavjud",
          HttpStatus.CONFLICT,
        );
      }
      await this.teacherRepo.update(id, {
        name: body.name,
        surname: body.surname,
        department: department ? department : teacher.department,
        updated_at: new Date(),
      });
      return {
        success: true,
        message: 'Yangilandi',
        statusCode: HttpStatus.OK,
        data: await this.teacherRepo.findOne({ where: { id }, relations: {department: true}}),
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

      let teacher = await this.teacherRepo.findOne({
        where: { id, faculty: {id: admin.faculty.id}}
      });

      if (teacher) {
        await this.teacherRepo.remove(teacher);
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: "O'chirildi",
        };
      } else {
        throw new HttpException(
          "Bunday o'qituvchi yo'q",
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
