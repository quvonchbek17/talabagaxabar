import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
// import { CreatePermissionDto, UpdatePermissionDto, PermissionsService } from "@modules"
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, PermissionParamsIdDto, UpdatePermissionArrayDto } from './dto';
import { SetRoles, rolesName } from '@common';
import { JwtAuthGuard, HasRole } from '@guards';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @SetRoles(rolesName.developer, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post("create")
  create(@Body() body: CreatePermissionDto) {
    return this.permissionsService.create(body);
  }

  @SetRoles(rolesName.developer, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get("all")
  get() {
    return this.permissionsService.getPermissions();
  }

  @SetRoles(rolesName.developer, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Patch()
  update(@Body() body: UpdatePermissionArrayDto) {
    return this.permissionsService.update(body);
  }

  @SetRoles(rolesName.developer, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(":id")
  remove(@Param() params: PermissionParamsIdDto) {
    return this.permissionsService.remove(params.id);
  }

}
