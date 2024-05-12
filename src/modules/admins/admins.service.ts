import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, University, AdminRole, Permission, Faculty } from '@entities';
import { rolesName } from '@common';
import { CreateAdminDto, UpdateAdminProfileDto } from './dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepo: Repository<Admin>,
    @InjectRepository(University)
    private readonly universityRepo: Repository<University>,
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
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
          permissions: true,
        },
      });

      let permissions = (await Permission.find()).map((el) => el.path);
      let adminRole = admin.role.name;

      delete admin.role;
      delete admin.password;
      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: {
          ...admin,
          permissions:
            adminRole === 'developer' || adminRole === 'super_admin'
              ? permissions
              : admin.permissions
              ? admin.permissions.map((el) => el.path)
              : [],
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
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
          permissions: true,
        },
      });

      let permissions = await Permission.find();
      if (!admin.role) {
        throw new HttpException(
          'Bu adminda role mavjud emas',
          HttpStatus.BAD_REQUEST,
        );
      }
      let adminRole = admin.role.name;
      delete admin.role;
      delete admin.password;
      return {
        success: true,
        statusCode: HttpStatus.OK,
        data:
          adminRole === 'developer' || adminRole === 'super_admin'
            ? permissions
            : admin.permissions
            ? admin.permissions.map((el) => {
                return { id: el.id, path: el.path, desc: el?.desc };
              })
            : [],
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createAdmin(adminId: string, body: CreateAdminDto) {
    try {
      let admin = await this.adminsRepo.findOne({
        where: { id: adminId },
        relations: { role: true, university: true, faculty: true },
      });

      let checkDuplicate = await this.adminsRepo.findOne({
        where: { adminname: body.adminname },
      });
      if (checkDuplicate) {
        throw new HttpException('Bu adminname band', HttpStatus.CONFLICT);
      }

      ///////// create university_admin /////////////
      if (admin.role?.name === rolesName.super_admin) {
        let role = await this.adminRolesRepo.findOne({
          where: { name: rolesName.university_admin },
        });

        let university = await this.universityRepo.findOne({
          where: { id: body.university_id },
        });

        if (!university) {
          throw new HttpException(
            "Bunday universitet yo'q",
            HttpStatus.NOT_FOUND,
          );
        }

        let permissions = await Promise.all(
          body.permissions.map((el) =>
            Permission.findOne({ where: { id: el } }),
          ),
        );

        let newAdmin = this.adminsRepo.create({
          adminname: body.adminname,
          password: body.password,
          fullname: body.fullname,
          university,
          role,
          permissions,
        });

        await this.adminsRepo.save(newAdmin);
        return {
          success: true,
          message: 'created',
          data: {
            id: newAdmin.id,
            adminname: newAdmin.adminname,
            fullname: newAdmin.fullname,
            role: newAdmin.role.name,
            university: newAdmin.university.name,
            permissions: permissions?.map((el) => {
              return {
                id: el.id,
                path: el.path,
                desc: el.desc,
              };
            }),
          },
        };
      }

      //////// create faculty_lead_admin and faculty_admin /////////
      if (admin.role?.name === rolesName.university_admin) {
        let role = await this.adminRolesRepo.findOne({
          where: {
            name: body.isLead
              ? rolesName.faculty_lead_admin
              : rolesName.faculty_admin,
          },
        });

        let faculty = await this.facultyRepo.findOne({
          where: { id: body.faculty_id },
        });

        if (!faculty) {
          throw new HttpException("Bunday fakultet yo'q", HttpStatus.NOT_FOUND);
        }

        let permissions = await Promise.all(
          body.permissions.map((el) =>
            Permission.findOne({ where: { id: el } }),
          ),
        );

        let newAdmin = this.adminsRepo.create({
          adminname: body.adminname,
          password: body.password,
          fullname: body.fullname,
          faculty,
          role,
          permissions,
        });

        await this.adminsRepo.save(newAdmin);
        return {
          success: true,
          message: 'created',
          data: {
            id: newAdmin.id,
            adminname: newAdmin.adminname,
            fullname: newAdmin.fullname,
            role: role.name,
            faculty: newAdmin.faculty.name,
            permissions: permissions?.map((el) => {
              return {
                id: el.id,
                path: el.path,
                desc: el.desc,
              };
            }),
          },
        };
      }

      //////// create faculty_admin /////////
      if (admin.role?.name === rolesName.faculty_lead_admin) {
        let role = await this.adminRolesRepo.findOne({
          where: {
            name: rolesName.faculty_admin,
          },
        });

        let faculty = await this.facultyRepo.findOne({
          where: { id: admin.faculty?.id },
        });

        if (!faculty) {
          throw new HttpException("Bunday fakultet yo'q", HttpStatus.NOT_FOUND);
        }

        let permissions = await Promise.all(
          body.permissions.map((el) =>
            Permission.findOne({ where: { id: el } }),
          ),
        );

        let newAdmin = this.adminsRepo.create({
          adminname: body.adminname,
          password: body.password,
          fullname: body.fullname,
          faculty,
          role,
          permissions,
        });

        await this.adminsRepo.save(newAdmin);
        return {
          success: true,
          message: 'created',
          data: {
            id: newAdmin.id,
            adminname: newAdmin.adminname,
            fullname: newAdmin.fullname,
            role: role.name,
            faculty: newAdmin.faculty.name,
            permissions: permissions?.map((el) => {
              return {
                id: el.id,
                path: el.path,
                desc: el.desc,
              };
            }),
          },
        };
      } else {
        return new HttpException(
          "Admin qo'shishga ruxsat berilmagan",
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

  async findAllAdmins(adminId: string) {
    try {
      let admin = await this.adminsRepo.findOne({
        where: { id: adminId },
        relations: { role: true, university: true, faculty: true },
      });

      if (admin.role?.name === rolesName.super_admin) {
        let [admins, count] = await this.adminsRepo
          .createQueryBuilder('a')
          .innerJoin('a.role', 'r')
          .innerJoin('a.university', 'u')
          .select(['a.id', 'a.fullname', 'a.adminname', 'a.img', 'u.id', 'u.name'])
          .where('r.name = :role', { role: rolesName.university_admin })
          .getManyAndCount();

        return {
          statusCode: HttpStatus.OK,
          success: true,
          message: 'success',
          data: {
            totalCount: count,
            items: admins,
          },
        };
      }

      if (admin.role?.name === rolesName.university_admin) {
        let [admins, count] = await this.adminsRepo
          .createQueryBuilder('a')
          .innerJoin('a.role', 'r')
          .innerJoin('a.faculty', 'f')
          .innerJoin('f.university', 'u')
          .select(['a.id', 'a.fullname', 'a.adminname', 'a.img', 'f.id', 'f.name'])
          .where('(r.name = :role1 OR r.name = :role2)', {
            role1: rolesName.faculty_admin,
            role2: rolesName.faculty_lead_admin,
          })
          .andWhere('u.id = :universityId', {
            universityId: admin.university?.id,
          })
          .getManyAndCount();

        return {
          statusCode: HttpStatus.OK,
          success: true,
          message: 'success',
          data: {
            totalCount: count,
            items: admins,
          },
        };
      }

      if (admin.role?.name === rolesName.faculty_lead_admin) {
        let [admins, count] = await this.adminsRepo
          .createQueryBuilder('a')
          .innerJoin('a.role', 'r')
          .innerJoin('a.faculty', 'f')
          .innerJoin('f.university', 'u')
          .select(['a.id', 'a.fullname', 'a.adminname', 'a.img', 'f.id', 'f.name'])
          .where('r.name = :role', { role: rolesName.faculty_admin })
          .andWhere('f.id = :facultyId', { facultyId: admin.faculty?.id })
          .getManyAndCount();

        return {
          statusCode: HttpStatus.OK,
          success: true,
          message: 'success',
          data: {
            totalCount: count,
            items: admins,
          },
        };
      } else {
        throw new HttpException('Ruxsatga ega emassiz', HttpStatus.FORBIDDEN);
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
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
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(
    id: string,
    body: UpdateAdminProfileDto,
    file: Express.Multer.File,
  ) {
    try {
      let admin = await this.adminsRepo.findOne({
        where: { id },
      });

      if (admin.password !== body.oldpassword) {
        throw new HttpException('Oldingi parol xato !', HttpStatus.BAD_REQUEST);
      }

      let filename = '';
      if (file) {
        this.filesService.deleteFiles('avatars', admin?.img);
        filename = await this.filesService.saveFile(file, 'avatars');
      }

      await this.adminsRepo.update(id, {
        adminname: body.adminname,
        password: body.newpassword,
        fullname: body.fullname,
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

  async remove(adminId: string, deletedAdminId: string) {
    try {
      let admin = await this.adminsRepo.findOne({
        where: { id: adminId },
        relations: { role: true, university: true, faculty: true },
      });

      if (admin.role?.name === rolesName.super_admin) {
        let deletedAdmin = await this.adminsRepo.findOne({
          where: {
            id: deletedAdminId,
            role: { name: rolesName.university_admin },
          },
        });
        if (deletedAdmin) {
          await this.adminsRepo.remove(deletedAdmin);
          return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "O'chirildi",
          };
        } else {
          throw new HttpException(
            "Bunday admin mavjud emas yoki o'chirish uchun sizga ruxsat berilmagan",
            HttpStatus.NOT_FOUND,
          );
        }
      }

      if (admin.role?.name === rolesName.university_admin) {
        let deletedAdmin = await this.adminsRepo.findOne({
          where: {
            id: deletedAdminId,
            faculty: { university: {id: admin.university?.id} },
          },
        });

        if (deletedAdmin) {
          await this.adminsRepo.remove(deletedAdmin);
          return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "O'chirildi",
          };
        } else {
          throw new HttpException(
            "Bunday admin mavjud emas yoki o'chirish uchun sizga ruxsat berilmagan",
            HttpStatus.NOT_FOUND,
          );
        }
      }

      if (admin.role?.name === rolesName.faculty_lead_admin) {
        let deletedAdmin = await this.adminsRepo.findOne({
          where: {
            id: deletedAdminId,
            faculty: { id: admin.faculty?.id },
            role: { name: rolesName.faculty_admin },
          },
        });

        if (deletedAdmin) {
          await this.adminsRepo.remove(deletedAdmin);
          return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "O'chirildi",
          };
        } else {
          throw new HttpException(
            "Bunday admin mavjud emas yoki o'chirish uchun sizga ruxsat berilmagan",
            HttpStatus.NOT_FOUND,
          );
        }
      } else {
        return new HttpException(
          'Sizga ruxsat berilmagan',
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
}
