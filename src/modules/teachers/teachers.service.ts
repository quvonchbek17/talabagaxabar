import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, Department, Science, Teacher } from '@entities';
import { ILike, Not, Repository } from 'typeorm';
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

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

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

  async get(search: string, page: number, limit: number, adminId: string) {
    try {
      page = page ? page : 1;
      limit = limit ? limit : 10;

      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      let qb = this.teacherRepo.createQueryBuilder('t')
      .leftJoinAndSelect('t.department', 'd')
      .leftJoinAndSelect('t.sciences', 's')

      if(search){
        qb.where('t.name ILike :search OR t.surname ILike :search', {
          search: `%${search}%`,
        })
      }

      if (admin.role?.name === rolesName.super_admin) {
          qb.leftJoinAndSelect('t.faculty', 'f')
          .select(['t.id','t.name','t.surname','f.id','f.name','d.id','d.name','s.id','s.name',])
      } else {
        if (!admin.faculty) {
          throw new HttpException(
            "Sizning fakultetingiz yo'q",
            HttpStatus.FORBIDDEN,
          );
        }

        qb.select(['t.id','t.name','t.surname','d.id','d.name','s.id','s.name',])
        .andWhere('t.faculty_id = :id', { id: admin.faculty?.id })
      }

      let [teachers, count] = await qb
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
          relations: { department: true, faculty: true, sciences: true },
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
        relations: { department: true, sciences: true },
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
        relations: { faculty: true, department: true },
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

      let checkDuplicate = await this.teacherRepo.createQueryBuilder('t')
      .innerJoin('t.department', 'd')
      .innerJoin('t.faculty', 'f')
      .where('t.id != :teacherId AND t.name = :name AND t.surname = :surname AND d.id = :departmentId AND f.id = :facultyId',
       {teacherId: teacher.id ,name: body.name, surname: body.surname, departmentId: body.department_id ? body.department_id : teacher.department?.id, facultyId: admin.faculty?.id })
      .getOne()

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
