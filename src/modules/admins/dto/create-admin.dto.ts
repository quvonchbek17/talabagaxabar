import { IsArray, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateUniversityAdminDto {
    @IsString()
    readonly adminname: string;

    @IsString()
    readonly password: string;

    @IsString()
    @IsUUID()
    readonly university_id: string;


    @IsArray()
    @IsUUID(undefined, { each: true })
    readonly permissions: string[];

}
