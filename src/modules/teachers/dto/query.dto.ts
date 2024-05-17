import { IsOptional, IsString, IsUUID } from "class-validator";
export class FindAllQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsUUID()
    department_id?: string;

    @IsOptional()
    @IsUUID()
    science_id?: string;

    @IsOptional()
    @IsUUID()
    faculty_id?: string;

  }
