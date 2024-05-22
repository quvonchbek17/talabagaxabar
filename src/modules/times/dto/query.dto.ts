import { IsOptional, IsString, IsUUID } from "class-validator";
export class FindAllQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsUUID()
    @IsOptional()
    readonly education_id: string;

    @IsOptional()
    @IsUUID()
    faculty_id?: string;
}
