import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateGroupDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    readonly name: string;

    @IsNumber()
    readonly student_count: number;

    @IsUUID()
    @IsString()
    @IsOptional()
    readonly direction_id: string;

    @IsUUID()
    @IsString()
    @IsOptional()
    readonly education_id: string;

    @IsUUID()
    @IsString()
    @IsOptional()
    readonly course_id: string;
}