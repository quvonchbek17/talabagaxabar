import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { CreateUniversityDto } from './dto/create.dto';
import { UpdateUniversityDto } from './dto/update.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('universities')
@ApiTags("Universities")
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Post("create")
  @ApiOperation({
    summary: "Universitet qo'shish"
  })
  async create(@Body() body: CreateUniversityDto) {
    return await this.universitiesService.create(body);
  }

  @Get()
  @ApiOperation({
    summary: "Universitetlarni olish"
  })
  findAll() {
    return this.universitiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: "Universitetni idsi bo'yicha olish"
  })
  findOne(@Param('id') id: string) {
    return this.universitiesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: "Universitetni update qilish"
  })
  update(@Param('id') id: string, @Body() updateUniversityDto: UpdateUniversityDto) {
    return this.universitiesService.update(+id, updateUniversityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.universitiesService.remove(+id);
  }
}
