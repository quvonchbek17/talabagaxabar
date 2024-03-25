import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentParamsDto, UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { SetRoles } from 'src/common/decorators/set-roles.decorator';
import { HasRole } from '../auth/guards/roles.guard';
import { rolesName } from 'src/common/consts/roles';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post("create")
  async create(@Body() body: CreateDepartmentDto) {
    return await this.departmentsService.create(body);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param() params: DepartmentParamsDto) {
    return this.departmentsService.findOne(params.id);
  }

  @Patch(':id')
  update(@Param() params: DepartmentParamsDto, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(params.id, updateDepartmentDto);
  }

  @Delete(':id')
  remove(@Param() params: DepartmentParamsDto) {
    return this.departmentsService.remove(params.id);
  }
}
