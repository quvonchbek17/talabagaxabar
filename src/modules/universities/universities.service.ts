import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUniversityDto } from './dto/create.dto';
import { UniversityParamsIdDto, UpdateUniversityDto } from './dto/update.dto';
import { University } from 'src/entities/university.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UniversitiesService {
  constructor(
    @InjectRepository(University)
    private readonly universityRepo: Repository<University>,
  ) {}
  async create(body: CreateUniversityDto) {
      try {
        let isDuplicate = await this.universityRepo.findOne({
          where: { name: body.name },
        });
        if (isDuplicate) {
          throw new HttpException("Bu universitet avval qo'shilgan", HttpStatus.CONFLICT);
        }
        let university =  this.universityRepo.create(body);
        await university.save();
        return {
          success: true,
          message: "Yaratildi",
          statusCode: HttpStatus.CREATED,
          data: university
        }
      } catch (error) {
          throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST)
      }
  }

  async findAll() {
    try {
      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: await this.universityRepo.find({select: ["id", "name"]})
      };
    } catch (error) {
        throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST)
    }
  }

  async pagination(page: number, limit: number) {
    try {
      let [universities, count] = await this.universityRepo
        .createQueryBuilder("u")
        .select(["u.id", "u.name"])
        .offset((page - 1) * limit)
        .limit(limit)
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
          items: universities
        }
      };
    } catch (error) {
      return new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: string) {
    try {
      let university = await this.universityRepo.findOne({where: {id}});
      if(university){
        return {
          success: true,
          statusCode: HttpStatus.OK,
          data: university
        }
      } else {
        throw new HttpException("Bunday universitet yo'q", HttpStatus.NOT_FOUND)
      }
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST)
    }
  }

  async update(id: string, body: UpdateUniversityDto) {
    try {
      let university = await this.universityRepo.findOne({ where: { id } });
      if (university) {
        await this.universityRepo.update(id, {name: body.name, updated_at: new Date()});
        return {
          success: true,
          message: 'Yangilandi',
          statusCode: HttpStatus.OK,
          data: await this.universityRepo.findOne({ where: { id }}),
        };
      } else {
        throw new HttpException("Bunday universitet yo'q", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: string) {
    try {
      let university = await this.universityRepo.findOne({where: {id}})
      if(university) {
        await this.universityRepo.remove(university)
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: "O'chirildi"
        }
      } else {
        throw new HttpException("Bunday universitet yo'q", HttpStatus.NOT_FOUND)
      }
  } catch (error) {
    throw  new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
  }
  }
}
