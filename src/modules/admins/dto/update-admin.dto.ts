import { IsArray, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class UpdateAdminProfileDto  {
    @IsString()
    @IsOptional()
    readonly fullname: string;

    @IsString()
    @IsOptional()
    readonly adminname: string;

    @IsString()
    @IsOptional()
    readonly oldpassword: string;

    @IsString()
    @IsOptional()
    readonly newpassword: string;
}

export class AdminParamsIdDto {
    @IsUUID()
    id: string;
}
