import { IsOptional, IsString, IsUUID } from "class-validator";
export class FindAllQueryDto {
    @IsOptional()
    @IsString()
    search?: string;
    
    @IsOptional()
    @IsString()
    day?: string;

    @IsOptional()
    @IsUUID()
    time_id?: string;

    @IsOptional()
    @IsUUID()
    faculty_id?: string;
}
