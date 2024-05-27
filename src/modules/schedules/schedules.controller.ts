import { Request, Response } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { SetRoles, rolesName } from '@common';
import { JwtAuthGuard, HasRole } from '@guards';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto, FindAllQueryDto, ScheduleParamsIdDto, UpdateScheduleDto, CreateSchedulePdfDto } from './dto';
import * as fs from 'fs';


@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @SetRoles(rolesName.faculty_lead_admin, rolesName.faculty_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post('create')
  async create(@Body() body: CreateScheduleDto, @Req() req: Request) {
    return this.schedulesService.create(body, req.user?.id);
  }


  @SetRoles(rolesName.faculty_lead_admin, rolesName.faculty_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post('pdf')
  async downloadSchedulePdf(@Req() req: Request, @Res() res: Response, @Body() body: CreateSchedulePdfDto ) {
    try {
      let filePath = await this.schedulesService.createSchedulePdf(body?.groups, req.user?.id);
      res.download(filePath, 'Schedule.pdf', (err) => {
        if (err) {
          res.status(500).send({
            statusCode: 500,
            success: false,
            message: 'PDF yaratishda xatolik yuz berdi',
          });
        }
        // Faylni o'chirish
        fs.unlinkSync(filePath);
      });

    } catch (error) {
      res.status(403).send({
        statusCode: error.status || HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
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
      const {
        day,
        teacher_id,
        time_id,
        room_id,
        group_id,
        science_id,
        faculty_id,
      } = allquery;
      if (
        day ||
        teacher_id ||
        time_id ||
        room_id ||
        group_id ||
        science_id ||
        faculty_id ||
        page ||
        limit
      ) {
        return this.schedulesService.get(
          day,
          teacher_id,
          time_id,
          room_id,
          group_id,
          science_id,
          faculty_id,
          page,
          limit,
          req.user.id,
        );
      } else if (Object.keys(allquery).length === 0) {
        return this.schedulesService.get('', '', '', '', '', '', '', 0, 0, req.user.id);
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

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get(':id')
  async findOne(@Param() params: ScheduleParamsIdDto, @Req() req: Request) {
    return this.schedulesService.findOne(params?.id, req.user?.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Patch(':id')
  update(@Param() params: ScheduleParamsIdDto, @Body() body: UpdateScheduleDto, @Req() req: Request) {
    return this.schedulesService.update(params?.id, body, req.user?.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(':id')
  remove(@Param() params: ScheduleParamsIdDto, @Req() req: Request) {
    return this.schedulesService.remove(params?.id, req.user.id);
  }
}
