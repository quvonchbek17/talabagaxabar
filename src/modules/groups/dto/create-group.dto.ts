import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateGroupDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsUUID()
    @IsString()
    readonly direction_id: string;

    @IsUUID()
    @IsString()
    readonly education_id: string;

    @IsUUID()
    @IsString()
    readonly course_id: string;
}
