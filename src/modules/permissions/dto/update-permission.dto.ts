import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdatePermissionDto {
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    readonly id: string;

    @IsString()
    @IsOptional()
    readonly path: string;

    @IsString()
    @IsOptional()
    readonly desc: string;

}
