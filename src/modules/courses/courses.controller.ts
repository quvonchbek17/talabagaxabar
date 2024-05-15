import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, DefaultValuePipe, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { SetRoles, rolesName } from '@common';
import { JwtAuthGuard, HasRole } from '@guards';
import { CoursesService } from './courses.service';
import { CourseParamsIdDto, CreateCourseDto, UpdateCourseDto } from './dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @SetRoles(rolesName.faculty_lead_admin, rolesName.faculty_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post("create")
  async create(@Body() body: CreateCourseDto, @Req() req: Request) {
    return this.coursesService.create(body, req.user?.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get()
  async findAll(@Req() req: Request, @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number, @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit: number, @Query('search') search: string, @Query() allquery: any) {
       try {
        if (search || page || limit) {
          return this.coursesService.get(search, page, limit, req.user.id);
        } else if(Object.keys(allquery).length === 0) {
          return this.coursesService.get("", 0, 0, req.user.id);
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
  async findOne(@Param() params: CourseParamsIdDto, @Req() req: Request) {
    return this.coursesService.findOne(params?.id, req.user?.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Patch(':id')
  update(@Param() params: CourseParamsIdDto, @Body() body: UpdateCourseDto, @Req() req: Request) {
    return this.coursesService.update(params?.id, body, req.user?.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(':id')
  remove(@Param() params: CourseParamsIdDto, @Req() req: Request) {
    return this.coursesService.remove(params?.id, req.user?.id);
  }
}
