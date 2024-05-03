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
    readonly departmentRepo: Repository<Department>
  ){}
  async create(body: CreateTeacherDto, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true },
      });
      let checkDuplicate = await this.teacherRepo.findOne({
        where: { name: body.name, surname: body.surname, department: {id: body.department_id}, faculty: { id: admin.faculty.id } },
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
          faculty: {id: admin.faculty.id}
        }
      })

      if(!department){
        throw new HttpException("Bunday idlik kafedra mavjud emas", HttpStatus.BAD_REQUEST)
      }

      let teacher =  this.teacherRepo.create({
        name: body.name,
        surname: body.surname,
        department: department,
        faculty: admin.faculty,
      });
      await teacher.save();

      delete teacher.faculty.created_at
      delete teacher.faculty.updated_at
      delete teacher.department.created_at
      delete teacher.department.updated_at

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
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      if (admin.role?.name === rolesName.super_admin) {
        let teachers = await this.teacherRepo
        .createQueryBuilder('t')
        .innerJoin('t.faculty', 'f')
        .innerJoin('t.department', 'd')
        .select(['t.id', 't.name', 't.surname', 'd.id', 'd.name', 'f.id', 'f.name'])
        .getMany();
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: teachers,
        };
      }

      if (admin?.faculty) {
        let teachers = await this.teacherRepo.find({
          where: { faculty: { id: admin.faculty.id } },
        });
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: teachers,
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

      if (admin.role.name === rolesName.super_admin) {
        let [teachers, count] = await this.teacherRepo
          .createQueryBuilder('t')
          .innerJoin('t.faculty', 'f')
          .innerJoin('t.department', 'd')
          .select(['t.id', 't.name', 't.surname', 'd.id', 'd.name', 'f.id', 'f.name'])
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
        .innerJoin('t.department', 'd')
        .select(['t.id', 't.name', 't.surname', 'd.id', 'd.name'])
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

  async searchByName(searchedName: string, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      if (admin.role?.name === rolesName.super_admin) {
        let directions = await this.teacherRepo.find({
          where: [
            {
              name: ILike(`%${searchedName}%`),
            },
            {
              surname: ILike(`%${searchedName}%`),
            },
          ],
          relations: { faculty: true},
        });

        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: directions,
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let teachers = await this.teacherRepo.find({
        where: [
          {
            name: ILike(`%${searchedName}%`),
            faculty: { id: admin.faculty.id },
          },
          {
            surname: ILike(`%${searchedName}%`),
            faculty: { id: admin.faculty.id },
          },
        ],
      });

      return {
        statusCode: HttpStatus.OK,
        success: true,
        data: teachers,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} teacher`;
  }

  update(id: number, updateTeacherDto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  remove(id: number) {
    return `This action removes a #${id} teacher`;
  }
}
