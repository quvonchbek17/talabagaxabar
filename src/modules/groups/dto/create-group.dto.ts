import { IsArray, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class CreateGroupDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsNumber()
    readonly student_count: number;

    @IsUUID()
    @IsString()
    readonly direction_id: string;

    @IsUUID()
    @IsString()
    readonly education_id: string;

    @IsUUID()
    @IsString()
    readonly course_id: string;

    @IsArray()
    @IsUUID(undefined, { each: true })
    readonly times: string[];
}
