import { IsString, IsNotEmpty, IsUUID } from "class-validator"
export class GroupPublicParamDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    readonly direction_id: string;

    @IsString()
    @IsNotEmpty()
    @IsUUID()
    readonly course_id: string;

    @IsString()
    @IsNotEmpty()
    @IsUUID()
    readonly education_id: string;
}