import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateTeacherDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    readonly surname: string;

    @IsString()
    @IsNotEmpty()
    readonly degree: string;

    @IsUUID()
    readonly department_id: string;

    @IsArray()
    @IsUUID(undefined, { each: true })
    readonly sciences: string[];
}
