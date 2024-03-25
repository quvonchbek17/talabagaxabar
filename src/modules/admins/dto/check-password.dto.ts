import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CheckPassword {
    @IsString()
    @MaxLength(20)
    readonly password: string;
}
