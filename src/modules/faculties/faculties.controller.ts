import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { FacultiesService } from './faculties.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { FacultyParamsIDDto, UpdateFacultyDto } from './dto/update-faculty.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { HasRole } from '../auth/guards/roles.guard';
import { SetRoles, rolesName } from '@common';

@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @SetRoles(rolesName.university_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post("create")
  create(@Body() createFacultyDto: CreateFacultyDto, @Req() req: Request) {
    return this.facultiesService.create(createFacultyDto, req.user.id);
  }

  @SetRoles(rolesName.university_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get("all")
  findAll(@Req() req: Request) {
    return this.facultiesService.findAll(req.user.id);
  }


  @SetRoles(rolesName.university_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get()
  pagination(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: Request
  ) {
    return this.facultiesService.pagination(page, limit, req.user.id);
  }

  @SetRoles(rolesName.university_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get("search")
  searchByName(
    @Query('name') name: string,
    @Req() req: Request
  ) {

    return this.facultiesService.searchByName(name, req.user.id);
  }

  @SetRoles(rolesName.university_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get(':id')
  async findOne(@Param() params: any, @Req() req: Request) {
    return this.facultiesService.findOne(params.id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFacultyDto: UpdateFacultyDto) {
    return this.facultiesService.update(+id, updateFacultyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facultiesService.remove(+id);
  }
}
