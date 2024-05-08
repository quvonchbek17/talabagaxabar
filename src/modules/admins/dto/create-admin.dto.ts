import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateAdminDto {
    @IsString()
    readonly fullname: string;

    @IsString()
    readonly adminname: string;

    @IsString()
    readonly password: string;

    @IsString()
    @IsUUID()
    @IsOptional()
    readonly university_id: string;

    @IsString()
    @IsUUID()
    @IsOptional()
    readonly faculty_id: string;

    @IsBoolean()
    @IsOptional()
    readonly isLead: string;


    @IsArray()
    @IsUUID(undefined, { each: true })
    readonly permissions: string[];

}
