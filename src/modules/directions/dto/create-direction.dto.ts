import { IsNotEmpty, IsString } from "class-validator";

export class CreateDirectionDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string
}
