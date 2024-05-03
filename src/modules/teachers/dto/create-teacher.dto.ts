import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateTeacherDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    readonly surname: string;

    @IsUUID()
    readonly department_id: string;
}
