import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DepartmentsRepository } from 'src/entities/departments.entity';
import { Repository } from 'typeorm';
import { FacultiesRepository } from 'src/entities/faculties.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(DepartmentsRepository)
    private readonly departmentRepo: Repository<DepartmentsRepository>,

    @InjectRepository(FacultiesRepository)
    private readonly facultyRepo: Repository<FacultiesRepository>,
  ) {}
  async create(body: CreateDepartmentDto) {
    try {
      let faculty = await this.facultyRepo.findOne({where: {id: body?.faculty_id}})
      if(body?.faculty_id && !faculty){
        return new NotFoundException("Bunday idlik fakultet yo'q")
      }

      let department = this.departmentRepo.create({...body, faculty});
      await department.save();
      return department;
    } catch (error) {
      return new BadRequestException(error);
    }
  }

  async findAll() {
    return await this.departmentRepo.find();
  }

  async findOne(id: string) {
    let department = await this.departmentRepo.findOne({ where: { id } });
    if(department){
      return department
    } else {
      return new NotFoundException("Bunday idlik kafedra yo'q")
    }
  }

  async update(id: string, body: UpdateDepartmentDto) {
    try {
      let faculty = await this.facultyRepo.findOne({where: {id: body?.faculty_id}})
      if(body?.faculty_id && !faculty){
        return new NotFoundException("Bunday idlik fakultet yo'q")
      }

      let department = this.departmentRepo.findOne({ where: { id } });
      if (department) {
        await this.departmentRepo.update(id, {name: body.name, faculty});
        return {
          message: 'Yangilandi',
          data: await this.departmentRepo.findOne({ where: { id }}),
        };
      } else {
        return new NotFoundException("Bunday idlik kafedra yo'q");
      }
    } catch (error) {
      return new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {
    try {
        let department = await this.departmentRepo.findOne({where: {id}})
        if(department) {
          await this.departmentRepo.remove(department)
          return {
            message: "O'chirildi"
          }
        } else {
          return {
            message: "Bunday idlik kafedra yo'q"
          }
        }
    } catch (error) {
      return  new InternalServerErrorException(error);
    }
  }
}