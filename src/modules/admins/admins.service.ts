import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateUniversityAdminDto } from './dto/create-admin.dto';
import { UpdateUniversityAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, University, AdminRole } from '@entities';
import { rolesName } from 'src/common/consts/roles';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepo: Repository<Admin>,
    @InjectRepository(University)
    private readonly universityRepo: Repository<University>,
    @InjectRepository(AdminRole)
    private readonly adminRolesRepo: Repository<AdminRole>,
  ) {}

  async getProfile(user: { id: string; role: string }) {
    try {
      let { id, role } = user;
      let admin = await this.adminsRepo.findOne({
        where: { id },
        relations: {
          university: role === rolesName.university_admin,
          faculty: role === rolesName.faculty_admin,
        },
      });

      delete admin.password;
      return {
        success: true,
        data: admin,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async createUniversityAdmin(body: CreateUniversityAdminDto) {
    try {
      let university = await this.universityRepo.findOne({
        where: { id: body.university_id },
      });

      let admin = await this.adminsRepo.findOne({
        where: { adminname: body.adminname },
      });
      if (admin) {
        throw new HttpException('Bu adminname band', HttpStatus.CONFLICT);
      }

      let role = await this.adminRolesRepo.findOne({
        where: { name: 'university_admin' },
      });

      if (!university) {
        throw new HttpException("Bunday universitet yo'q", HttpStatus.NOT_FOUND);
      }

      let newAdmin = this.adminsRepo.create({
        adminname: body.adminname,
        password: body.password,
        university,
        role,
      });
      this.adminsRepo.save(newAdmin);
      return {
        success: true,
        data: newAdmin,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async findAllUniversityAdmins() {
    try {
      return {
        success: true,
        data: await this.adminsRepo.find({
          where: { role: { name: rolesName.university_admin } },
          relations: { university: true },
        }),
      };
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  async findOneUniversityAdmin(id: string) {
    try {
      let admin = await this.adminsRepo.findOne({
        where: { id },
        relations: { university: true },
      });

      if (admin) {
        return {
          success: true,
          data: admin,
        };
      } else {
        throw new HttpException("Bunday admin yo'q", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async checkPassword(id: string, password: string) {
    try {
      let [admin] = await this.adminsRepo.find({ where: { id, password } });
      if (admin) {
        return {
          message: "Parol to'g'ri",
          status: HttpStatus.OK,
        };
      } else {
        throw new HttpException("Parol noto'g'ri", HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  update(id: number, updateAdminDto: UpdateUniversityAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
