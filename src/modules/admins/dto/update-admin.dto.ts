import { PartialType } from '@nestjs/swagger';
import { CreateUniversityAdminDto } from './create-admin.dto';
import { IsUUID } from 'class-validator';

export class UpdateUniversityAdminDto extends PartialType(CreateUniversityAdminDto) {}

export class AdminParamsIdDto {
    @IsUUID()
    id: string;
}
