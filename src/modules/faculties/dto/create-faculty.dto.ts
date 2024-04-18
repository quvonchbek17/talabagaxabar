import { IsNotEmpty, IsString, IsUUID } from "class-validator";
export class CreateFacultyDto {

    @IsString()
    @IsNotEmpty()
    readonly name: string;
}
