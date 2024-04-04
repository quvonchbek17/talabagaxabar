import { PartialType } from '@nestjs/swagger';
import { CreateUniversityAdminDto } from './create-admin.dto';
import { IsArray, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class UpdateAdminProfileDto  {

    @IsString()
    readonly adminname: string;


    @IsString()
    readonly oldpassword: string;

    @IsString()
    readonly newpassword: string;
}

export class AdminParamsIdDto {
    @IsUUID()
    id: string;
}
