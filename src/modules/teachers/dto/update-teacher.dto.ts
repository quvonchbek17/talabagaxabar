import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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
}
