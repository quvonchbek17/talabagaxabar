import { PartialType } from '@nestjs/swagger';
import { CreateDepartmentDto } from './create-department.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
export class DepartmentParamsDto {
    @IsUUID()
    id: string;
}
