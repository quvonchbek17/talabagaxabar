import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentParamsDto, UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('departments')
@ApiTags("Departments")
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("create")
  @ApiOperation({
    summary: "Kafedra qo'shish"
  })
  @ApiHeader({
    name: 'Authorization',
    allowEmptyValue: false,
    required: true,
    schema: {
      example: 'Bearer eyJhbGciOiJIUzI1NiJ9.Zjk0ZjA0OGUtYzVlMi00OWMxLWIzNjEtYzkyM2U0NDliNjJk.dWpOUlDAJHHN2L6cTomGrPXOLiES0tLxSvVsHgPnuPY',
    }
  })
  async create(@Body() body: CreateDepartmentDto) {
    return await this.departmentsService.create(body);
  }

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @ApiParam({
    name: 'id',
    allowEmptyValue: false,
    required: true,
    schema: {
      example: '2f2a5e2f-4015-4bd6-9da5-86cf7138f440',
    }
  })
  @Get(':id')
  async findOne(@Param() params: DepartmentParamsDto) {
    return this.departmentsService.findOne(params.id);
  }

  @ApiParam({
    name: 'id',
    allowEmptyValue: false,
    required: true,
    schema: {
      example: '2f2a5e2f-4015-4bd6-9da5-86cf7138f440',
    }
  })
  @Patch(':id')
  update(@Param() params: DepartmentParamsDto, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(params.id, updateDepartmentDto);
  }

  @ApiParam({
    name: 'id',
    allowEmptyValue: false,
    required: true,
    schema: {
      example: '2f2a5e2f-4015-4bd6-9da5-86cf7138f440',
    }
  })
  @Delete(':id')
  remove(@Param() params: DepartmentParamsDto) {
    return this.departmentsService.remove(params.id);
  }
}
