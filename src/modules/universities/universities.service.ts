import { Injectable } from '@nestjs/common';
import { CreateUniversityDto } from './dto/create.dto';
import { UpdateUniversityDto } from './dto/update.dto';
import { UniversitiesRepository } from 'src/entities/universities.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UniversitiesService {
  constructor(@InjectRepository(UniversitiesRepository) private readonly universityRepo: Repository<UniversitiesRepository>){

  }
  async create(body: CreateUniversityDto) {
    let university =  this.universityRepo.create(body);
    await university.save()
    return university
  }

  async findAll() {
    return await this.universityRepo.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} university`;
  }

  update(id: number, updateUniversityDto: UpdateUniversityDto) {
    return `This action updates a #${id} university`;
  }

  remove(id: number) {
    return `This action removes a #${id} university`;
  }
}
