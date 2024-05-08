import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  ILike, Repository } from 'typeorm';
import { Department, Admin } from '@entities';
import { rolesName } from '@common';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}
  async create(body: CreateDepartmentDto, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true },
      });
      let checkDuplicate = await this.departmentRepo.findOne({
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

      let department = this.departmentRepo.create({
        ...body,
        faculty: admin.faculty,
      });
      await department.save();
      return {
        statusCode: HttpStatus.OK,
        message: 'Kafedra saqlandi',
        success: true,
        data: department,
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
        let [departments, count] = await this.departmentRepo
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
          items: departments,
        },
      };
      }

      if (admin?.faculty) {
        let [departments, count] = await this.departmentRepo
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
          items: departments,
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
        let [departments, count] = await this.departmentRepo
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
            items: departments,
          },
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let [departments, count] = await this.departmentRepo
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
          items: departments,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async searchByName(searchedName: string, page: number, limit: number, adminId: string) {
    try {
      page = page ? page : 1
      limit = limit ? limit : 10

      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });



      if (admin.role?.name === rolesName.super_admin) {
      let [departments, count] = await this.departmentRepo
      .createQueryBuilder('d')
      .innerJoin('d.faculty', 'f')
      .select(['d.id', 'd.name', 'f.id', 'f.name'])
      .offset((page - 1) * limit)
      .limit(limit)
      .where('d.name ILike :searchedName', { searchedName: `%${searchedName}%` })
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
          items: departments,
        },
      };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let [departments, count] = await this.departmentRepo
      .createQueryBuilder('d')
      .select(['d.id', 'd.name'])
      .offset((page - 1) * limit)
      .limit(limit)
      .where('d.faculty_id = :id', { id: admin.faculty.id })
      .andWhere('d.name ILike :searchedName', { searchedName: `%${searchedName}%` })
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
          items: departments,
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
        let department = await this.departmentRepo.findOne({
          where: { id },
          relations: { faculty: true },
        });
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: department,
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }
      let department = await this.departmentRepo.findOne({
        where: { id, faculty: { id: admin.faculty.id } },
      });
      if (department) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: department,
        };
      } else {
        throw new HttpException(
          "Sizning fakultetingizda bunday idlik kafedra yo'q",
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

  async update(id: string, body: UpdateDepartmentDto, adminId: string) {
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

      let department = await this.departmentRepo.findOne({
        where: { id, faculty: { id: admin.faculty.id } },
        relations: { faculty: true },
      });

      if (!department) {
        throw new HttpException(
          'Bunday kafedra mavjud emas yoki siz uchun ruxsat berilmagan',
          HttpStatus.NOT_FOUND,
        );
      }

      let checkDuplicate = await this.departmentRepo.findOne({
        where: { name: body.name, faculty: { id: admin.faculty.id } },
        relations: { faculty: true },
      });

      if (checkDuplicate) {
        throw new HttpException(
          'Bu nomlik kafedra allaqachon mavjud',
          HttpStatus.CONFLICT,
        );
      }
      await this.departmentRepo.update(id, {
        name: body.name,
        updated_at: new Date(),
      });
      return {
        success: true,
        message: 'Yangilandi',
        statusCode: HttpStatus.OK,
        data: await this.departmentRepo.findOne({ where: { id } }),
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

      let department = await this.departmentRepo.findOne({
        where: { id, faculty: {id: admin.faculty.id}}
      });

      if (department) {
        await this.departmentRepo.remove(department);
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: "O'chirildi",
        };
      } else {
        throw new HttpException(
          "Bunday kafedra yo'q",
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
