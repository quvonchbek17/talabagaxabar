import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, DefaultValuePipe, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { TimesService } from './times.service';
import { CreateTimeDto, FindAllQueryDto, TimeParamsIdDto, UpdateTimeDto } from './dto';
import { SetRoles, rolesName } from '@common';
import { JwtAuthGuard, HasRole } from '@guards';

@Controller('times')
export class TimesController {
  constructor(private readonly timesService: TimesService) {}

  @SetRoles(rolesName.faculty_lead_admin, rolesName.faculty_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post('create')
  async create(@Body() body: CreateTimeDto, @Req() req: Request) {
    return this.timesService.create(body, req.user?.id);
  }

  @SetRoles(
    rolesName.faculty_admin,
    rolesName.faculty_lead_admin,
    rolesName.super_admin,
  )
  @UseGuards(JwtAuthGuard, HasRole)
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit: number,
    @Query() allquery: FindAllQueryDto,
  ) {
    try {
      const {search, education_id, faculty_id} = allquery
      if (search || education_id || faculty_id || page || limit) {
        return this.timesService.get(search, education_id, faculty_id, page, limit, req.user.id);
      } else if (Object.keys(allquery).length === 0) {
        return this.timesService.get('', '', '', 0, 0, req.user.id);
      } else {
        throw new HttpException(
          "Bunday so'rov mavjud emas",
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @SetRoles(
    rolesName.faculty_admin,
    rolesName.faculty_lead_admin,
    rolesName.super_admin,
  )
  @UseGuards(JwtAuthGuard, HasRole)
  @Get(':id')
  async findOne(@Param() params: TimeParamsIdDto, @Req() req: Request) {
    return this.timesService.findOne(params?.id, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Patch(':id')
  update(
    @Param() params: TimeParamsIdDto,
    @Body() body: UpdateTimeDto,
    @Req() req: Request,
  ) {
    return this.timesService.update(params?.id, body, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(':id')
  remove(@Param() params: TimeParamsIdDto, @Req() req: Request) {
    return this.timesService.remove(params?.id, req.user?.id);
  }
}
