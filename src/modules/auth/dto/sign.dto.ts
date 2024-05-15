import { IsNotEmpty, IsString, Length, Matches } from 'class-validator'

export class Sign {
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
}
