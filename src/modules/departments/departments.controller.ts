import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, DefaultValuePipe, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentParamsIdDto, FindAllQueryDto } from './dto';
import { HasRole, JwtAuthGuard } from '@guards';
import { rolesName, SetRoles } from '@common';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @SetRoles(rolesName.faculty_lead_admin, rolesName.faculty_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post("create")
  async create(@Body() body: CreateDepartmentDto, @Req() req: Request) {
    return this.departmentsService.create(body, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get()
  async findAll(@Req() req: Request, @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number, @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit: number, @Query() allquery: FindAllQueryDto) {
       try {
        const {search, faculty_id} = allquery
        if (search || faculty_id || page || limit) {
          return this.departmentsService.get(search, faculty_id, page, limit, req.user.id);
        } else if(Object.keys(allquery).length === 0) {
          return this.departmentsService.get("", "", 0, 0, req.user.id);
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
  async findOne(@Param() params: DepartmentParamsIdDto, @Req() req: Request) {
    return this.departmentsService.findOne(params?.id, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Patch(':id')
  update(@Param() params: DepartmentParamsIdDto, @Body() body: UpdateDepartmentDto, @Req() req: Request) {
    return this.departmentsService.update(params?.id, body, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(':id')
  remove(@Param() params: DepartmentParamsIdDto, @Req() req: Request) {
    return this.departmentsService.remove(params?.id, req.user.id);
  }
}
