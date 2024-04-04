import { IsArray, IsNotEmpty, IsString,  ValidateNested } from "class-validator";
import { Type } from "class-transformer"

export class PermissonDto {
    @IsString()
    readonly path: string;

    @IsString()
    readonly desc: string;
}


export class CreatePermissionDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissonDto)
    readonly permissions: PermissonDto[];

}
