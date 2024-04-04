import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import {FileInterceptor} from "@nestjs/platform-express"
import { AdminsService } from './admins.service';
import { CreateUniversityAdminDto } from './dto/create-admin.dto';
import { UpdateAdminProfileDto } from './dto/update-admin.dto';
import { SetPermission, SetRoles, rolesName, permissions } from '@common';
import { JwtAuthGuard, HasRole, CheckPermission } from '@guards';
import { UniversityParamsIdDto } from '../universities/dto/update.dto';
import { CheckPasswordDto } from './dto/check-password.dto';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return this.adminsService.getProfile(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('permissions/all')
  getPermissions(@Req() req: Request) {
    return this.adminsService.getPermissions(req.user);
  }

  @SetPermission(permissions.admins.createUniversity)
  @SetRoles(rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole, CheckPermission)
  @Post("create")
  postUniversityAdmin(@Body() body: CreateUniversityAdminDto) {
    return this.adminsService.createUniversityAdmin(body);
  }

  @SetPermission(permissions.admins.getUniversities)
  @SetRoles(rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole, CheckPermission)
  @Get("universities/all")
  getUniversityAdmins() {
    return this.adminsService.findAllUniversityAdmins();
  }

  @SetPermission(permissions.admins.getUniversityById)
  @SetRoles(rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole, CheckPermission)
  @Get('universities/:id')
  getOneUniversityAdmin(@Param() params: UniversityParamsIdDto) {
    return this.adminsService.findOneUniversityAdmin(params.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkPassword')
  checkPassword(@Req() req: Request, @Body() body: CheckPasswordDto) {
    return this.adminsService.checkPassword(req.user.id, body.password);
  }


  @UseGuards(JwtAuthGuard)
  @Patch('profile/update')
  @UseInterceptors(FileInterceptor("img"))
  update(@Req() req: Request,@Body() body: UpdateAdminProfileDto, @UploadedFile() file: Express.Multer.File) {
    return this.adminsService.update(req.user.id, body, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminsService.remove(+id);
  }
}
