import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTimeDto } from './dto/create-time.dto';
import { UpdateTimeDto } from './dto/update-time.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, Education, Time } from '@entities';
import { Repository } from 'typeorm';
import { rolesName } from '@common';

@Injectable()
export class TimesService {

  constructor(
    @InjectRepository(Time)
    private readonly timeRepo: Repository<Time>,
    @InjectRepository(Education)
    private readonly educationRepo: Repository<Education>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  async create(body: CreateTimeDto, adminId: string) {
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
        where: { id: body.education_id, faculty: {id: admin.faculty?.id} }
      });

      if(!education){
        throw new HttpException("Bu idlik ta'lim turi mavjud emas", HttpStatus.NOT_FOUND);
      }

      let checkDuplicate = await this.timeRepo.findOne({
        where: { name: body.name, education: {id: body.education_id}, faculty: { id: admin.faculty?.id } },
      });

      if (checkDuplicate) {
        throw new HttpException("Bu vaqt avval qo'shilgan", HttpStatus.CONFLICT);
      }

      let time = this.timeRepo.create({
        name: body.name,
        education,
        faculty: admin.faculty,
      });
      await time.save();
      return {
        statusCode: HttpStatus.OK,
        message: 'Vaqt saqlandi',
        success: true,
        data: time,
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
    education_id: string,
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

      let qb = this.timeRepo.createQueryBuilder('t')
      .leftJoinAndSelect("t.education", "e")

      if (admin.role?.name === rolesName.super_admin) {
        qb.innerJoin('t.faculty', 'f').select([
          't.id',
          't.name',
          'e.id',
          'e.name',
          'f.id',
          'f.name',
        ]);

        if (faculty_id) {
          qb.andWhere('f.id = :facultyId', { facultyId: faculty_id });
        }
      } else {
        if (!admin.faculty) {
          throw new HttpException(
            "Sizning fakultetingiz yo'q",
            HttpStatus.FORBIDDEN,
          );
        }

        qb.select(['t.id', 't.name', 'e.id', 'e.name']).andWhere('t.faculty_id = :id', {
          id: admin.faculty?.id,
        });
      }

      if (search) {
        qb.andWhere('t.name ILike :search', { search: `%${search}%` });
      }

      if (education_id) {
        qb.andWhere('e.id = :education_id', { education_id });
      }

      let [times, count] = await qb
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
          items: times,
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
        let time = await this.timeRepo.findOne({
          where: { id },
          relations: { faculty: true, education: true },
        });
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: time,
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }
      let time = await this.timeRepo.findOne({
        where: { id, faculty: { id: admin.faculty?.id} },
        relations: {education: true}
      });
      if (time) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: time,
        };
      } else {
        throw new HttpException(
          "Sizning fakultetingizda bunday idlik vaqt yo'q",
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

  async update(id: string, body: UpdateTimeDto, adminId: string) {
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

      let time = await this.timeRepo.findOne({
        where: { id, faculty: { id: admin.faculty?.id } },
        relations: { faculty: true, education: true },
      });

      if (!time) {
        throw new HttpException(
          'Bunday vaqt mavjud emas yoki siz uchun ruxsat berilmagan',
          HttpStatus.NOT_FOUND,
        );
      }

      let education = await this.educationRepo.findOne({
        where: { id: body.education_id, faculty: {id: admin.faculty?.id} }
      });

      if(!education && body.education_id){
        throw new HttpException("Bu idlik ta'lim turi mavjud emas", HttpStatus.NOT_FOUND);
      }

      let checkDuplicate = await this.timeRepo
        .createQueryBuilder('t')
        .innerJoin('t.faculty', 'f')
        .leftJoinAndSelect('t.education', 'e')
        .where('t.id != :timeId AND e.id != :education_id AND t.name = :name AND f.id = :facultyId', {
          timeId: time.id,
          name: body.name,
          education_id: body.education_id || time.education?.id,
          facultyId: admin.faculty?.id,
        })
        .getOne();

      if (checkDuplicate) {
        throw new HttpException(
          'Bu vaqt allaqachon mavjud',
          HttpStatus.CONFLICT,
        );
      }
      await this.timeRepo.update(id, {
        name: body.name || time.name,
        education: education || time.education,
        updated_at: new Date(),
      });
      return {
        success: true,
        message: 'Yangilandi',
        statusCode: HttpStatus.OK,
        data: await this.timeRepo.findOne({ where: { id }, relations: {education: true} }),
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

      let time = await this.timeRepo.findOne({
        where: { id, faculty: { id: admin.faculty.id } },
      });

      if (time) {
        await this.timeRepo.remove(time);
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: "O'chirildi",
        };
      } else {
        throw new HttpException("Bunday vaqt yo'q", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
