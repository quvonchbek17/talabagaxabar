import {
  BadRequestException,
  ConflictException,
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
    let isDuplicate = await this.universityRepo.findOne({
      where: { name: body.name },
    });
    if (isDuplicate) {
      return new ConflictException("Bu universitet avval qo'shilgan");
    }
    let university = this.universityRepo.create(body);
    await university.save();
    return {
      success: true,
      data: university
    }
  }

  async findAll() {
    return {
      success: true,
      data: await this.universityRepo.find()
    };
  }

  async findOne(id: string) {
    try {
      let university = await this.universityRepo.findOne({where: {id}});
      if(university){
        return {
          success: true,
          data: university
        }
      } else {
        return  {
          success: false,
          message: "Bunday universitet yo'q"
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message)
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
          data: await this.universityRepo.findOne({ where: { id }}),
        };
      } else {
        return new NotFoundException("Bunday universitet yo'q");
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {
    try {
      let university = await this.universityRepo.findOne({where: {id}})
      if(university) {
        await this.universityRepo.remove(university)
        return {
          success: true,
          message: "O'chirildi"
        }
      } else {
        return {
          success: false,
          message: "Bunday universitet yo'q"
        }
      }
  } catch (error) {
    throw  new InternalServerErrorException(error);
  }
  }
}
