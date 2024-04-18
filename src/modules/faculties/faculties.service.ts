import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { Faculty } from 'src/entities/faculty.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { University } from 'src/entities/university.entity';
import { Admin } from '@entities';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
    @InjectRepository(University)
    private readonly universityRepo: Repository<University>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}
  async create(body: CreateFacultyDto, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { university: true },
      });
      let checkDuplicate = await this.facultyRepo.findOne({
        where: { name: body.name, university: { id: admin.university.id } },
      });

      if (checkDuplicate) {
        throw new HttpException(
          "Bu fakultet avval qo'shilgan",
          HttpStatus.CONFLICT,
        );
      }
      if (!admin.university) {
        throw new HttpException(
          "Sizning universitetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let faculty = this.facultyRepo.create({
        ...body,
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

  async findAll(adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { university: true },
      });

      if (admin?.university) {
        let faculties = await this.facultyRepo.find({
          where: { university: { id: admin.university.id } },
        });
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: faculties,
        };
      } else {
        throw new HttpException(
          "Sizning universitetingiz yo'q",
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

  async findOne(id: string, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { university: true },
      });

      if(!admin.university){
        throw new HttpException("Sizning universitetingiz yo'q", HttpStatus.FORBIDDEN)
      }
      let faculty = await this.facultyRepo.findOne({ where: { id, university: { id: admin.university.id } } });
      if (faculty) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: faculty
        };
      } else {
        throw new HttpException("Sizning universitetingizda bunday idlik fakultet yo'q", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST)
    }
  }

  async pagination(page: number, limit: number, adminId: string) {
    try {

      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { university: true },
      });

      if(!admin.university){
        throw new HttpException("Sizning universitetingiz yo'q", HttpStatus.FORBIDDEN)
      }

      let [faculties, count] = await this.facultyRepo
        .createQueryBuilder("f")
        .select(["f.id", "f.name"])
        .offset((page - 1) * limit)
        .limit(limit)
        .where("f.university_id = :id", { id: admin.university.id })
        .getManyAndCount();
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: "success",
        data: {
          currentPage: page,
          currentCount: limit,
          totalCount: count,
          totalPages: Math.ceil(count / limit),
          items: faculties
        }
      };
    } catch (error) {
      return new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  async searchByName(searchedName: string, adminId:string){
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { university: true },
      });

      if(!admin.university){
        throw new HttpException("Sizning universitetingiz yo'q", HttpStatus.FORBIDDEN)
      }

       let faculties = await this.facultyRepo.find({
        where: {
         name: ILike(`%${searchedName}%`),
         university: {id: admin.university.id}
        }
       })

       return {
         statusCode: HttpStatus.OK,
         success: true,
         data: faculties
       }
    } catch (error) {
         throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST)
    }
 }

  update(id: number, updateFacultyDto: UpdateFacultyDto) {
    return `This action updates a #${id} faculty`;
  }

  remove(id: number) {
    return `This action removes a #${id} faculty`;
  }
}
