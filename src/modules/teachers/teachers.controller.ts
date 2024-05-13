import { Request } from "express"
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, DefaultValuePipe, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { SetRoles, rolesName } from '@common';
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { HasRole } from "../auth/guards/roles.guard";
import { TeacherParamsIdDto } from "./dto";

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post("create")
  create(@Body() body: CreateTeacherDto, @Req() req: Request) {
    return this.teachersService.create(body, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get()
  async findAll(@Req() req: Request, @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number, @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit: number, @Query('search') search: string, @Query() allquery: any) {
    try {
     if (search || page || limit) {
       return this.teachersService.get(search, page, limit, req.user.id);
     } else if(Object.keys(allquery).length === 0) {
       return this.teachersService.get("", 0, 0, req.user.id);
     } else {
       throw new HttpException("Bunday so'rov mavjud emas", HttpStatus.NOT_FOUND)
     }
    } catch (error) {
        throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST)
    }
}

@SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin, rolesName.super_admin)
@UseGuards(JwtAuthGuard, HasRole)
@Get(':id')
async findOne(@Param() params: TeacherParamsIdDto, @Req() req: Request) {
  return this.teachersService.findOne(params?.id, req.user.id);
}

@SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
@UseGuards(JwtAuthGuard, HasRole)
@Patch(':id')
update(@Param() params: TeacherParamsIdDto, @Body() body: UpdateTeacherDto, @Req() req: Request) {
  return this.teachersService.update(params?.id, body, req.user.id);
}

@SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
@UseGuards(JwtAuthGuard, HasRole)
@Delete(':id')
remove(@Param() params: TeacherParamsIdDto, @Req() req: Request) {
  return this.teachersService.remove(params?.id, req.user.id);
}
}
