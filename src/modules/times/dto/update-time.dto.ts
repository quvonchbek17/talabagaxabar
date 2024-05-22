import { IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from "class-validator";
export class UpdateTimeDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Vaqt SS:MM formatida berilishi kerak' })
    readonly name: string

    @IsUUID()
    @IsOptional()
    readonly education_id: string;
}
