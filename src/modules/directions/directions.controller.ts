import { Request } from "express"
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard, HasRole } from '@guards';
import { SetRoles, rolesName } from '@common';
import { DirectionsService } from './directions.service';
import { CreateDirectionDto, UpdateDirectionDto } from './dto';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.directionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDirectionDto: UpdateDirectionDto) {
    return this.directionsService.update(+id, updateDirectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.directionsService.remove(+id);
  }
}
