import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { FacultiesRepository } from 'src/entities/faculties.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UniversitiesRepository } from 'src/entities/universities.entity';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(FacultiesRepository)
    private readonly facultyRepo: Repository<FacultiesRepository>,
    @InjectRepository(UniversitiesRepository)
    private readonly universityRepo: Repository<UniversitiesRepository>,
  ){}
  async create(body: CreateFacultyDto) {
    try {
      let university = await this.universityRepo.findOne({where: {id: body?.university_id}})
      if(body?.university_id && !university){
        return new NotFoundException("Bunday idlik universitet yo'q")
      }

      let faculty = this.facultyRepo.create({...body, university});
      await faculty.save();
      return faculty;
    } catch (error) {
      return new BadRequestException(error);
    }
  }

  async findAll() {
    return await this.facultyRepo.find({relations: {university: true}});
  }

  async findOne(id: string) {
    let faculty = await this.facultyRepo.findOne({ where: { id } });
    if(faculty){
      return faculty
    } else {
      return new NotFoundException("Bunday idlik fakeltet yo'q")
    };
  }

  update(id: number, updateFacultyDto: UpdateFacultyDto) {
    return `This action updates a #${id} faculty`;
  }

  remove(id: number) {
    return `This action removes a #${id} faculty`;
  }
}
