import { IsOptional, IsString, IsUUID } from "class-validator";
export class FindAllQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsUUID()
    faculty_id?: string;
  }
