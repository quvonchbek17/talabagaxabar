import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, DefaultValuePipe, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { SetRoles, rolesName } from '@common';
import { JwtAuthGuard, HasRole } from '@guards';
import { SciencesService } from './sciences.service';
import { CreateScienceDto, UpdateScienceDto, ScienceParamsIdDto } from './dto';

@Controller('sciences')
export class SciencesController {
  constructor(private readonly sciencesService: SciencesService) {}

  @SetRoles(rolesName.faculty_lead_admin, rolesName.faculty_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post("create")
  async create(@Body() body: CreateScienceDto, @Req() req: Request) {
    return  this.sciencesService.create(body, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get()
  async findAll(@Req() req: Request, @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number, @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit: number, @Query('search') search: string, @Query() allquery: any) {
       try {
        if (search) {
          return this.sciencesService.search(search, page, limit, req.user.id);
        } else if (page && limit) {
          return this.sciencesService.pagination(page, limit, req.user.id);
        } else if(Object.keys(allquery).length === 0) {
          return this.sciencesService.findAll(req.user.id);
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
  async findOne(@Param() params: ScienceParamsIdDto, @Req() req: Request) {
    return this.sciencesService.findOne(params?.id, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Patch(':id')
  update(@Param() params: ScienceParamsIdDto, @Body() body: UpdateScienceDto, @Req() req: Request) {
    return this.sciencesService.update(params?.id, body, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(':id')
  remove(@Param() params: ScienceParamsIdDto, @Req() req: Request) {
    return this.sciencesService.remove(params?.id, req.user.id);
  }
}
