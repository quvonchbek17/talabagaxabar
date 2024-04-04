import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CheckPasswordDto {
    @IsString()
    @MaxLength(20)
    readonly password: string;
}
