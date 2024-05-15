import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Matches, MaxLength, MinLength } from "class-validator";

export class CreateAdminDto {
    @IsString()
    @IsNotEmpty()
    readonly fullname: string;

    @IsString()
    @IsNotEmpty()
    @Length(4, 20, { message: "Username minimum 4, maximum 20 ta belgidan iborat bo'lishi kerak" })
    @Matches(/^[a-zA-Z0-9]+$/, { message: "Usernameda bo'sh joy(probel) ishlatish mumkin emas.Faqat raqam va harflar qatnashishi mumkin" })
    readonly adminname: string;

    @IsString()
    @IsNotEmpty()
    @Length(4, 20, { message: "Parol minimum 4, maximum 20 ta belgidan iborat bo'lishi kerak" })
    @Matches(/^[a-zA-Z0-9!@#$]+$/, { message: "Parolda bo'sh joy(probel) ishlatish mumkin emas. Faqat raqam, harf, (!, @, #, $) belgilari qatnashishi mumkin" })
    readonly password: string;

    @IsString()
    @IsUUID()
    @IsOptional()
    readonly university_id: string;

    @IsString()
    @IsUUID()
    @IsOptional()
    readonly faculty_id: string;

    @IsBoolean()
    @IsOptional()
    readonly isLead: string;


    @IsArray()
    @IsUUID(undefined, { each: true })
    readonly permissions: string[];

}
