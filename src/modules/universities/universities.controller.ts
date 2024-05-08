import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SetRoles, rolesName } from '@common';
import { HasRole, JwtAuthGuard } from '@guards';
import { UniversitiesService } from './universities.service';
import {
  CreateUniversityDto,
  UniversityParamsIdDto,
  UpdateUniversityDto,
} from './dto';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @SetRoles(rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post('create')
  async create(@Body() body: CreateUniversityDto) {
    return this.universitiesService.create(body);
  }

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
        return this.universitiesService.searchByName(search, page, limit);
      } else if (page && limit) {
        return this.universitiesService.pagination(page, limit);
      } else if (Object.keys(allquery).length === 0) {
        return this.universitiesService.findAll();
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

  @Get(':id')
  findOne(@Param() params: UniversityParamsIdDto) {
    return this.universitiesService.findOne(params.id);
  }

  @SetRoles(rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Patch(':id')
  update(
    @Param() params: UniversityParamsIdDto,
    @Body() updateUniversityDto: UpdateUniversityDto,
  ) {
    return this.universitiesService.update(params.id, updateUniversityDto);
  }

  @SetRoles(rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Delete(':id')
  remove(@Param() params: UniversityParamsIdDto) {
    return this.universitiesService.remove(params.id);
  }
}
