import { IsNotEmpty, IsString, Matches } from "class-validator";


export class UpdateTimeDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Vaqt SS:MM formatida berilishi kerak' })
    readonly name: string
}
