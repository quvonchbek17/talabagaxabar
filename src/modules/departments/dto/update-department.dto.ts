import { PartialType } from '@nestjs/swagger';
import { CreateDepartmentDto } from './create-department.dto';
import { IsUUID } from 'class-validator';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
