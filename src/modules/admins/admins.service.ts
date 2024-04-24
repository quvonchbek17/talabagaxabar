import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, University, AdminRole, Permission } from '@entities';
import { rolesName } from '@common';
import { CreateUniversityAdminDto, UpdateAdminProfileDto } from './dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepo: Repository<Admin>,
    @InjectRepository(University)
    private readonly universityRepo: Repository<University>,
    @InjectRepository(AdminRole)
    private readonly adminRolesRepo: Repository<AdminRole>,
    private readonly filesService: FilesService,
  ) {}

  async getProfile(user: { id: string; role: string }) {
    try {
      let { id, role } = user;
      let admin = await this.adminsRepo.findOne({
        where: { id },
        relations: {
          university: role === rolesName.university_admin,
          faculty: role === rolesName.faculty_admin,
          role: true,
          permissions: true
        },
      });

      let permissions =  (await Permission.find()).map(el => el.path)
      let adminRole = admin.role.name

      delete admin.role
      delete admin.password;
      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: {
          ...admin,
          permissions: adminRole === "developer" || adminRole === "super_admin" ? permissions : admin.permissions ? admin.permissions.map(el => el.path) : []
        },
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  async getPermissions(user: { id: string; role: string }) {
    try {
      let { id, role } = user;
      let admin = await this.adminsRepo.findOne({
        where: { id },
        relations: {
          university: role === rolesName.university_admin,
          faculty: role === rolesName.faculty_admin,
          role: true,
          permissions: true
        }
      });

      let permissions =  await Permission.find()
      if(!admin.role){
        throw new HttpException("Bu adminda role mavjud emas", HttpStatus.BAD_REQUEST)
      }
      let adminRole = admin.role.name
      delete admin.role
      delete admin.password;
      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: adminRole === "developer" || adminRole === "super_admin" ? permissions : admin.permissions ? admin.permissions.map(el => {return {id: el.id, path: el.path, desc: el?.desc}}) : []
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
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

      let permissions = await Promise.all(body.permissions.map((el) => Permission.findOne({where: {id: el}})))

      if (!university) {
        throw new HttpException("Bunday universitet yo'q", HttpStatus.NOT_FOUND);
      }

      let newAdmin = this.adminsRepo.create({
        adminname: body.adminname,
        password: body.password,
        university,
        role,
        permissions
      });
      await this.adminsRepo.save(newAdmin);
      return {
        success: true,
        data: {
          id: newAdmin.id,
          adminname: newAdmin.adminname,
          role: newAdmin.role.name,
          university: newAdmin.university.name,
          permissions: permissions?.map(el => {
            return {
              id: el.id,
              path: el.path,
              desc: el.desc
            }
          })
        },
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }


  async findAllUniversityAdmins() {
    try {
      let admins = await this.adminsRepo.createQueryBuilder("a")
      .leftJoinAndSelect("a.university", "u")
      .leftJoinAndSelect("a.permissions", "p")
      .select(["a.id", "a.adminname", "u.id", "u.name", "p.path", "p.desc"])
      .getMany()

      let mappedAdmins = []
      for(let admin of admins){
        let permissions = admin.permissions.map(el => { return {path: el.path, desc: el.desc}})
        delete admin.permissions
        mappedAdmins.push({...admin, permissions})
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: mappedAdmins
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST)
    }
  }

  async findOneUniversityAdmin(id: string) {
    try {
      let admin = await this.adminsRepo.findOne({
        where: { id },
        relations: { university: true, permissions: true },
      });
      let permissions = await Promise.all(admin.permissions.map(el => { return {path: el.path, desc: el.desc}}))

      if (admin) {
        delete admin.permissions
        delete admin.password
        return {
          success: true,
          statusCode: HttpStatus.OK,
          data: {
            ...admin,
            permissions
          }
        };
      } else {
        throw new HttpException("Bunday admin yo'q", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  async checkPassword(id: string, password: string) {
    try {
      let [admin] = await this.adminsRepo.find({ where: { id, password } });
      if (admin) {
        return {
          success: true,
          message: "Parol to'g'ri",
          statusCode: HttpStatus.OK,
        };
      } else {
        throw new HttpException("Parol noto'g'ri", HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: string, body: UpdateAdminProfileDto, file: Express.Multer.File) {
    try {
      let admin = await this.adminsRepo.findOne({
        where: { id },
      });

      if(admin.password !== body.oldpassword){
        throw new HttpException("Oldingi parol xato !", HttpStatus.BAD_REQUEST)
      }

      let filename = '';
      if (file) {
        this.filesService.deleteFiles('avatars', admin.img)
        filename = await this.filesService.saveFile(file, 'avatars');
      }

      await this.adminsRepo.update(id, {
        adminname: body.adminname,
        password: body.newpassword,
        img: filename !== '' ? filename : admin.img,
        updated_at: new Date(),
      });

      return {
        success: true,
        message: 'Yangilandi',
        statusCode: HttpStatus.OK,
        data: await this.adminsRepo.findOne({ where: { id } }),
      };

    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
