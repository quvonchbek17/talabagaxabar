import { IsOptional, IsString, IsUUID } from "class-validator";
export class FindAllQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsUUID()
    direction_id?: string;

    @IsOptional()
    @IsUUID()
    course_id?: string;

    @IsOptional()
    @IsUUID()
    education_id?: string;

    @IsOptional()
    @IsUUID()
    faculty_id?: string;
  }
