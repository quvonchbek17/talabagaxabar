import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateUniversityAdminDto } from './dto/create-admin.dto';
import { AdminParamsIdDto, UpdateUniversityAdminDto } from './dto/update-admin.dto';
import { SetRoles, rolesName } from '@common';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { HasRole } from '../auth/guards/roles.guard';
import { UniversityParamsIdDto } from '../universities/dto/update.dto';
import { CheckPassword } from './dto/check-password.dto';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}


  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return this.adminsService.getProfile(req.user);
  }

  @SetRoles(rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Post("universities")
  postUniversityAdmin(@Body() body: CreateUniversityAdminDto) {
    return this.adminsService.createUniversityAdmin(body);
  }

  @SetRoles(rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get("universities")
  getUniversityAdmins() {
    return this.adminsService.findAllUniversityAdmins();
  }

  @SetRoles(rolesName.super_admin)
  @UseGuards(JwtAuthGuard, HasRole)
  @Get('universities/:id')
  getOneUniversityAdmin(@Param() params: UniversityParamsIdDto) {
    return this.adminsService.findOneUniversityAdmin(params.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkPassword')
  checkPassword(@Req() req: Request, @Body() body: CheckPassword) {
    return this.adminsService.checkPassword(req.user.id, body.password);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateUniversityAdminDto) {
    return this.adminsService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminsService.remove(+id);
  }
}
