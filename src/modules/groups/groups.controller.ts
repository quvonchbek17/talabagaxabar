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
  DefaultValuePipe,
  Query,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard, HasRole } from '@guards';
import { SetRoles, rolesName } from '@common';
import { GroupsService } from './groups.service';
import { CreateGroupDto, FindAllQueryDto, GroupParamsIdDto, UpdateGroupDto, GroupPublicParamDto } from './dto';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @SetRoles(rolesName.faculty_lead_admin, rolesName.faculty_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post('create')
  async create(@Body() body: CreateGroupDto, @Req() req: Request) {
    return this.groupsService.create(body, req.user?.id);
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
      const { search, direction_id, course_id, education_id, faculty_id } = allquery;
      if (
        search ||
        direction_id ||
        course_id ||
        education_id ||
        faculty_id ||
        page ||
        limit
      ) {
        return this.groupsService.get(
          search,
          direction_id,
          course_id,
          education_id,
          faculty_id,
          page,
          limit,
          req.user.id,
        );
      } else if (Object.keys(allquery).length === 0) {
        return this.groupsService.get('', '', '', '', '', 0, 0, req.user.id);
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

  @Get("public")
  async getPublic(@Query() query: GroupPublicParamDto) {
    return this.groupsService.getPublic(query);
  }

  @SetRoles(
    rolesName.faculty_admin,
    rolesName.faculty_lead_admin,
    rolesName.super_admin,
  )
  @UseGuards(JwtAuthGuard, HasRole)
  @Get(':id')
  async findOne(@Param() params: GroupParamsIdDto, @Req() req: Request) {
    return this.groupsService.findOne(params?.id, req.user.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Patch(':id')
  update(
    @Param() params: GroupParamsIdDto,
    @Body() body: UpdateGroupDto,
    @Req() req: Request,
  ) {
    return this.groupsService.update(params?.id, body, req.user?.id);
  }

  @SetRoles(rolesName.faculty_admin, rolesName.faculty_lead_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(':id')
  remove(@Param() params: GroupParamsIdDto, @Req() req: Request) {
    return this.groupsService.remove(params?.id, req.user?.id);
  }
}
