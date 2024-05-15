import { IsArray, IsOptional, IsString, IsUUID, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateAdminProfileDto  {
    @IsString()
    @IsOptional()
    readonly fullname: string;

    @IsString()
    @IsOptional()
    @Length(4, 20, { message: "Username minimum 4, maximum 20 ta belgidan iborat bo'lishi kerak" })
    @Matches(/^[a-zA-Z0-9]+$/, { message: "Usernameda bo'sh joy(probel) ishlatish mumkin emas. Faqat raqam va harflar qatnashishi mumkin" })
    readonly adminname: string;

    @IsString()
    @IsOptional()
    @Length(4, 20, { message: "Parol minimum 4, maximum 20 ta belgidan iborat bo'lishi kerak" })
    @Matches(/^[a-zA-Z0-9!@#$]+$/, { message: "Parolda bo'sh joy(probel) ishlatish mumkin emas. Faqat raqam, harf, (!, @, #, $) belgilari qatnashishi mumkin" })
    readonly oldpassword: string;

    @IsString()
    @IsOptional()
    @Length(4, 20, { message: "Parol minimum 4, maximum 20 ta belgidan iborat bo'lishi kerak" })
    @Matches(/^[a-zA-Z0-9!@#$]+$/, { message: "Parolda bo'sh joy(probel) ishlatish mumkin emas. Faqat raqam, harf, (!, @, #, $) belgilari qatnashishi mumkin" })
    readonly newpassword: string;
}

export class AdminParamsIdDto {
    @IsUUID()
    id: string;
}
