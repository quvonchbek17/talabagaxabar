import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateScienceDto } from './dto/create-science.dto';
import { UpdateScienceDto } from './dto/update-science.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, Science } from '@entities';
import { Repository } from 'typeorm';
import { rolesName } from '@common';

@Injectable()
export class SciencesService {
  constructor(
    @InjectRepository(Science)
    private readonly scienceRepo: Repository<Science>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}
  async create(body: CreateScienceDto, adminId: string) {
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

      let checkDuplicate = await this.scienceRepo.findOne({
        where: { name: body.name, faculty: { id: admin.faculty?.id } },
      });

      if (checkDuplicate) {
        throw new HttpException("Bu fan avval qo'shilgan", HttpStatus.CONFLICT);
      }

      let science = this.scienceRepo.create({
        name: body.name,
        faculty: admin.faculty,
      });
      await science.save();
      return {
        statusCode: HttpStatus.OK,
        message: 'Fan saqlandi',
        success: true,
        data: science,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async get(
    search: string,
    faculty_id: string,
    page: number,
    limit: number,
    adminId: string,
  ) {
    try {
      page = page ? page : 1;
      limit = limit ? limit : 10;

      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      let qb = this.scienceRepo.createQueryBuilder('s');

      if (search) {
        qb.where('s.name ILike :search', { search: `%${search}%` });
      }

      if (admin.role?.name === rolesName.super_admin) {
        qb.innerJoin('s.faculty', 'f').select([
          's.id',
          's.name',
          'f.id',
          'f.name',
        ]);

        if (faculty_id) {
          qb.where('f.id = :facultyId', { facultyId: faculty_id });
        }
      } else {
        if (!admin.faculty) {
          throw new HttpException(
            "Sizning fakultetingiz yo'q",
            HttpStatus.FORBIDDEN,
          );
        }

        qb.select(['s.id', 's.name']).andWhere('s.faculty_id = :id', {
          id: admin.faculty?.id,
        });
      }

      let [sciences, count] = await qb
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
          items: sciences,
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
        let science = await this.scienceRepo.findOne({
          where: { id },
          relations: { faculty: true },
        });
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: science,
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }
      let science = await this.scienceRepo.findOne({
        where: { id, faculty: { id: admin.faculty?.id } },
      });
      if (science) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: science,
        };
      } else {
        throw new HttpException(
          "Sizning fakultetingizda bunday idlik fan yo'q",
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

  async update(id: string, body: UpdateScienceDto, adminId: string) {
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

      let science = await this.scienceRepo.findOne({
        where: { id, faculty: { id: admin.faculty?.id } },
        relations: { faculty: true },
      });

      if (!science) {
        throw new HttpException(
          'Bunday fan mavjud emas yoki siz uchun ruxsat berilmagan',
          HttpStatus.NOT_FOUND,
        );
      }

      let checkDuplicate = await this.scienceRepo
        .createQueryBuilder('s')
        .innerJoin('s.faculty', 'f')
        .where('s.id != :scienceId AND s.name = :name AND f.id = :facultyId', {
          scienceId: science.id,
          name: body.name,
          facultyId: admin.faculty?.id,
        })
        .getOne();

      if (checkDuplicate) {
        throw new HttpException(
          'Bu nomlik fan allaqachon mavjud',
          HttpStatus.CONFLICT,
        );
      }
      await this.scienceRepo.update(id, {
        name: body.name || science.name,
        updated_at: new Date(),
      });
      return {
        success: true,
        message: 'Yangilandi',
        statusCode: HttpStatus.OK,
        data: await this.scienceRepo.findOne({ where: { id } }),
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

      let science = await this.scienceRepo.findOne({
        where: { id, faculty: { id: admin.faculty.id } },
      });

      if (science) {
        await this.scienceRepo.remove(science);
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: "O'chirildi",
        };
      } else {
        throw new HttpException("Bunday fan yo'q", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
