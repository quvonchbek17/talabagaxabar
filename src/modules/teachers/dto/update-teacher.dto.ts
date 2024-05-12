import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTeacherDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    readonly surname: string;

    @IsUUID()
    @IsOptional()
    readonly department_id: string;

    @IsArray()
    @IsUUID(undefined, { each: true })
    readonly sciences: string[];
}
