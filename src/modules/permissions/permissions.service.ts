import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreatePermissionDto,
  UpdatePermissionArrayDto,
  UpdatePermissionDto,
} from './dto';
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

  async update(body: UpdatePermissionArrayDto) {
    try {
      let { nonExistingpermissionIds, existingPermissions } =
        await this.checkExistingPermissions(body?.permissions);
      if (nonExistingpermissionIds.length > 0) {
        throw new HttpException(
          `${nonExistingpermissionIds.join(
            ', ',
          )} idlik permissionlar mavjud emas`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (existingPermissions && existingPermissions.length > 0) {
        for (let bodyPermission of body.permissions) {
          let permission = await this.permissionRepo.findOne({
            where: { id: bodyPermission.id },
          });
          await this.permissionRepo.update(permission.id, {
            path: bodyPermission.path || permission.path,
            desc: bodyPermission.desc || permission.desc,
            updated_at: new Date(),
          });
        }
      }

      return {
        success: true,
        message: 'Yangilandi',
        statusCode: HttpStatus.OK,
      };
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
        throw new HttpException("Bunday permission yo'q", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkExistingPermissions(permissions: UpdatePermissionDto[]) {
    const nonExistingpermissionIds: string[] = [];
    const existingPermissions: Permission[] = [];
    if (!permissions) {
      return {};
    }
    for (const permission of permissions) {
      const checkPermission = await this.permissionRepo.findOne({
        where: { id: permission.id },
      });
      if (!checkPermission) {
        nonExistingpermissionIds.push(permission.id);
      } else {
        existingPermissions.push(checkPermission);
      }
    }
    return { nonExistingpermissionIds, existingPermissions };
  }
}
