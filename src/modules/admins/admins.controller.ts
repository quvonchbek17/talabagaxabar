import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, DefaultValuePipe, Query, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import {FileInterceptor} from "@nestjs/platform-express"
import { AdminsService } from './admins.service';
import { JwtAuthGuard, HasRole, CheckPermission } from '@guards';
import { SetPermission, SetRoles, rolesName, permissions, sidebar, menu } from '@common';
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
  @Get('sidebar')
  getSideBar(@Req() req: Request) {
     try {
      return {
        success: true,
        statusCode: HttpStatus.OK,
        data:  sidebar
      }
     } catch (error) {
        throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST)
     }
  }

  @UseGuards(JwtAuthGuard)
  @Get('menu')
  getMenu(@Req() req: Request) {
    try {
      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: menu
      }
     } catch (error) {
        throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST)
     }
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

  @SetRoles(rolesName.faculty_lead_admin, rolesName.university_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get()
  async findAll(@Req() req: Request, @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number, @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit: number, @Query('search') search: string, @Query() allquery: any) {
    try {
     if (search || page || limit) {
       return this.adminsService.get(search, page, limit, req.user.id);
     } else if(Object.keys(allquery).length === 0) {
       return this.adminsService.get("", 0, 0, req.user.id);
     } else {
       throw new HttpException("Bunday so'rov mavjud emas", HttpStatus.NOT_FOUND)
     }
    } catch (error) {
        throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST)
    }
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
    return this.adminsService.update(req.user?.id, body, file);
  }

  @SetRoles(rolesName.super_admin, rolesName.faculty_lead_admin, rolesName.university_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(':id')
  remove(@Req() req: Request,  @Param() params: AdminParamsIdDto) {
    return this.adminsService.remove(req.user.id, params.id);
  }
}
