import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { CreateUniversityDto } from './dto/create.dto';
import { UniversityParamsIdDto, UpdateUniversityDto } from './dto/update.dto';
import { SetRoles } from 'src/common/decorators/set-roles.decorator';
import { rolesName } from 'src/common/consts/roles';
import { HasRole } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @SetRoles(rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post("create")
  async create(@Body() body: CreateUniversityDto) {
    return this.universitiesService.create(body)
  }

  @Get()
  findAll() {
    return this.universitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param() params: UniversityParamsIdDto) {
    return this.universitiesService.findOne(params.id);
  }

  @SetRoles(rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Patch(':id')
  update(@Param() params: UniversityParamsIdDto, @Body() updateUniversityDto: UpdateUniversityDto) {
    return this.universitiesService.update(params.id, updateUniversityDto);
  }

  @SetRoles(rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(':id')
  remove(@Param() params: UniversityParamsIdDto) {
    return this.universitiesService.remove(params.id);
  }
}
