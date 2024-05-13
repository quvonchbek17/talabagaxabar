import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, DefaultValuePipe, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { FacultiesService } from './faculties.service';
import { CreateFacultyDto, UpdateFacultyDto, FacultyParamsIDDto } from './dto';
import { JwtAuthGuard, HasRole } from '@guards';
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

  @SetRoles(rolesName.university_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get()
  async findAll(@Req() req: Request, @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number, @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit: number, @Query('search') search: string, @Query() allquery: any) {
    try {
     if (search || page || limit) {
       return this.facultiesService.get(search, page, limit, req.user.id);
     }else if(Object.keys(allquery).length === 0) {
       return this.facultiesService.get("", 0, 0, req.user.id);
     } else {
       throw new HttpException("Bunday so'rov mavjud emas", HttpStatus.NOT_FOUND)
     }
    } catch (error) {
        throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST)
    }
}

  @SetRoles(rolesName.university_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get(':id')
  async findOne(@Param() params: any, @Req() req: Request) {
    return this.facultiesService.findOne(params?.id, req.user.id);
  }

  @SetRoles(rolesName.university_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Patch(':id')
  update(@Param() params: FacultyParamsIDDto, @Body() body: UpdateFacultyDto, @Req() req: Request) {
    return this.facultiesService.update(params?.id, body, req.user.id);
  }

  @SetRoles(rolesName.university_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(':id')
  remove(@Param() params: FacultyParamsIDDto, @Req() req: Request) {
    return this.facultiesService.remove(params?.id, req.user.id);
  }
}
