import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import {FileInterceptor} from "@nestjs/platform-express"
import { AdminsService } from './admins.service';
import { JwtAuthGuard, HasRole, CheckPermission } from '@guards';
import { SetPermission, SetRoles, rolesName, permissions } from '@common';
import { CreateAdminDto, UpdateAdminProfileDto, CheckPasswordDto, AdminParamsIdDto } from './dto';
import { UniversityParamsIdDto } from '../universities/dto/update.dto';

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


  @SetRoles(rolesName.super_admin, rolesName.university_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post("create")
  postAdmin(@Req() req: Request,  @Body() body: CreateAdminDto) {
    return this.adminsService.createAdmin(req.user.id, body);
  }

  @SetRoles(rolesName.super_admin, rolesName.university_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get()
  getAllAdmins(@Req() req: Request) {
    return this.adminsService.findAllAdmins(req.user.id);
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

  @SetRoles(rolesName.super_admin, rolesName.faculty_lead_admin, rolesName.university_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(':id')
  remove(@Req() req: Request,  @Param() params: AdminParamsIdDto) {
    return this.adminsService.remove(req.user.id, params.id);
  }
}
