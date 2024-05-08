import { Request } from 'express';
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
} from '@nestjs/common';
import { JwtAuthGuard, HasRole } from '@guards';
import { SetRoles, rolesName } from '@common';
import { DirectionsService } from './directions.service';
import {
  CreateDirectionDto,
  DirectionParamsIdDto,
  UpdateDirectionDto,
} from './dto';

@Controller('directions')
export class DirectionsController {
  constructor(private readonly directionsService: DirectionsService) {}

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post('create')
  create(@Body() body: CreateDirectionDto, @Req() req: Request) {
    return this.directionsService.create(body, req.user.id);
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
    @Query('search') search: string,
    @Query() allquery: any,
  ) {
    try {
      if (search) {
        return this.directionsService.searchByName(
          search,
          page,
          limit,
          req.user.id,
        );
      } else if (page && limit) {
        return this.directionsService.pagination(page, limit, req.user.id);
      } else if (Object.keys(allquery).length === 0) {
        return this.directionsService.findAll(req.user.id);
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
  async findOne(@Param() params: DirectionParamsIdDto, @Req() req: Request) {
    return this.directionsService.findOne(params?.id, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Patch(':id')
  update(
    @Param() params: DirectionParamsIdDto,
    @Body() body: UpdateDirectionDto,
    @Req() req: Request,
  ) {
    return this.directionsService.update(params?.id, body, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(':id')
  remove(@Param() params: DirectionParamsIdDto, @Req() req: Request) {
    return this.directionsService.remove(params?.id, req.user.id);
  }
}
