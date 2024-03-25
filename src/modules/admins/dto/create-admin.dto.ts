import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateUniversityAdminDto {
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    readonly adminname: string;

    @IsString()
    @MinLength(6)
    @MaxLength(20)
    readonly password: string;

    @IsString()
    @IsUUID()
    readonly university_id: string;
}
