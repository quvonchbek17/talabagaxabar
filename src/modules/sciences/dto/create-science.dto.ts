import { IsNotEmpty, IsString } from "class-validator";

export class CreateScienceDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}
