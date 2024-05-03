import { Request } from "express"
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { SetRoles, rolesName } from '@common';
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { HasRole } from "../auth/guards/roles.guard";

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
  @Get("all")
  findAll(@Req() req: Request) {
    return this.teachersService.findAll(req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get()
  pagination(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: Request
  ) {
    return this.teachersService.pagination(page, limit, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get("search")
  searchByName(
    @Query('str') str: string,
    @Req() req: Request
  ) {
    return this.teachersService.searchByName(str, req.user.id);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.update(+id, updateTeacherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachersService.remove(+id);
  }
}
