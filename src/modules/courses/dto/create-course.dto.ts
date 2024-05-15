import { IsNotEmpty, IsString } from "class-validator";

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}
