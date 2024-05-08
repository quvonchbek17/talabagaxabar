import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateUniversityDto, UpdateUniversityDto } from './dto';
import { University } from '@entities';

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
      let page = 1
      let limit = 10
      let [universities, count] = await this.universityRepo
      .createQueryBuilder('u')
      .select(['u.id', 'u.name'])
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
        items: universities,
      },
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
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  async searchByName(searchedName: string, page: number, limit: number){
     try {
      page = page ? page : 1
      limit = limit ? limit : 10
      let [universities, count] = await this.universityRepo
      .createQueryBuilder('u')
      .select(['u.id', 'u.name'])
      .offset((page - 1) * limit)
      .limit(limit)
      .where('u.name ILike :searchedName', { searchedName: `%${searchedName}%` })
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
          items: universities,
        },
      };
     } catch (error) {
        throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST)
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
      let checkDuplicate = await this.universityRepo.findOne({ where: { name: body.name } });

      if(checkDuplicate){
        throw new HttpException("Bu nomdagi universitet allaqchon mavjud", HttpStatus.CONFLICT)
      }
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
