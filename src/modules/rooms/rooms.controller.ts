import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, DefaultValuePipe, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto, RoomParamsIdDto, FindAllQueryDto } from './dto';
import { SetRoles, rolesName } from '@common';
import { HasRole, JwtAuthGuard } from '@guards';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @SetRoles(rolesName.faculty_lead_admin, rolesName.faculty_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post("create")
  async create(@Body() body: CreateRoomDto, @Req() req: Request) {
    return this.roomsService.create(body, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin, rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get()
  async findAll(@Req() req: Request, @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number, @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit: number, @Query('capacityTo', new DefaultValuePipe(0), ParseIntPipe) capacityTo: number, @Query('capacityFrom', new DefaultValuePipe(0), ParseIntPipe) capacityFrom: number, @Query('floor', new DefaultValuePipe(0), ParseIntPipe) floor: number,  @Query() allquery: FindAllQueryDto) {
       try {
        const {search, time_id, day, faculty_id} = allquery
        if (search || time_id || day ||  faculty_id || capacityTo || capacityFrom || floor || page || limit) {
          return this.roomsService.get(search, time_id, day, faculty_id, capacityTo, capacityFrom, floor, page, limit, req.user.id);
        } else if(Object.keys(allquery).length === 0) {
          return this.roomsService.get("", "", "", "",  0, 0, 0, 0, 0, req.user.id);
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
  async findOne(@Param() params: RoomParamsIdDto, @Req() req: Request) {
    return this.roomsService.findOne(params?.id, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Patch(':id')
  update(@Param() params: RoomParamsIdDto, @Body() body: UpdateRoomDto, @Req() req: Request) {
    return this.roomsService.update(params?.id, body, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(':id')
  remove(@Param() params: RoomParamsIdDto, @Req() req: Request) {
    return this.roomsService.remove(params?.id, req.user.id);
  }
}
