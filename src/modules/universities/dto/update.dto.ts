import {PartialType } from '@nestjs/swagger';
import {IsUUID } from 'class-validator';
import { CreateUniversityDto } from './create.dto';

export class UpdateUniversityDto extends PartialType(CreateUniversityDto) {}
export class UniversityParamsIdDto {
    @IsUUID()
    id: string;
}
