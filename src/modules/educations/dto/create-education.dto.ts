import { IsNotEmpty, IsString } from "class-validator";

export class CreateEducationDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}
