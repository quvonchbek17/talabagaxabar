import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '@entities';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async getPermissions() {
    try {
      return {
        statusCode: HttpStatus.OK,
        data: await this.permissionRepo.find(),
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async create(body: CreatePermissionDto) {
    try {
      for (let i = 0; i < body.permissions.length; i++) {
        let perms = body.permissions[i];
        let isDuplicate = await this.permissionRepo.findOne({
          where: { path: perms.path },
        });

        if (isDuplicate) {
          throw new HttpException(
            `${perms} avval qo'shilgan. Qayta urinib ko'ring`,
            HttpStatus.CONFLICT,
          );
        }
        let permission = this.permissionRepo.create({
          path: perms.path,
          desc: perms.desc,
        });
        permission.save();
      }

      return {
        success: true,
        message: 'Yaratildi',
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(body: UpdatePermissionDto) {
    try {
      let permission = await this.permissionRepo.findOne({
        where: { id: body.id },
      });
      if (permission) {
        await this.permissionRepo.update(body.id, {
          path: body.path || permission.path,
          desc: body.desc || permission.desc,
          updated_at: new Date(),
        });
        return {
          success: true,
          message: 'Yangilandi',
          statusCode: HttpStatus.OK,
          data: await this.permissionRepo.findOne({ where: { id: body.id } }),
        };
      } else {
        return new HttpException(
          "Bunday universitet yo'q",
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    try {
      let permission = await this.permissionRepo.findOne({ where: { id } });
      if (permission) {
        await this.permissionRepo.remove(permission);
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: "O'chirildi",
        };
      } else {
        throw new HttpException(
          "Bunday permission yo'q",
          HttpStatus.NOT_FOUND,
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
