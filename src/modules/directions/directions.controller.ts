import { Request } from "express"
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard, HasRole } from '@guards';
import { SetRoles, rolesName } from '@common';
import { DirectionsService } from './directions.service';
import { CreateDirectionDto, DirectionParamsIdDto, UpdateDirectionDto } from './dto';

@Controller('directions')
export class DirectionsController {
  constructor(private readonly directionsService: DirectionsService) {}

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post("create")
  create(@Body() body: CreateDirectionDto, @Req() req: Request) {
    return this.directionsService.create(body, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get("all")
  findAll(@Req() req: Request) {
    return this.directionsService.findAll(req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get()
  pagination(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: Request
  ) {
    return this.directionsService.pagination(page, limit, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get("search")
  searchByName(
    @Query('name') name: string,
    @Req() req: Request
  ) {
    return this.directionsService.searchByName(name, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get(':id')
  async findOne(@Param() params: DirectionParamsIdDto, @Req() req: Request) {
    return this.directionsService.findOne(params?.id, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Patch(':id')
  update(@Param() params: DirectionParamsIdDto, @Body() body: UpdateDirectionDto, @Req() req: Request) {
    return this.directionsService.update(params?.id, body, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(':id')
  remove(@Param() params: DirectionParamsIdDto, @Req() req: Request) {
    return this.directionsService.remove(params?.id, req.user.id);
  }
}
