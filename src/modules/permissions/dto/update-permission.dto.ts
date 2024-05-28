import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

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

export class UpdatePermissionArrayDto {
    @ValidateNested({ each: true })
    @Type(() => UpdatePermissionDto)
    @ArrayMinSize(1)
    readonly permissions: UpdatePermissionDto[];
}
