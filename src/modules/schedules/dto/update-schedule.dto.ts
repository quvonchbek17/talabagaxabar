import { IsNotEmpty, IsString, IsIn, IsUUID, IsOptional, IsArray } from "class-validator";

export class UpdateScheduleDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @IsIn(['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'], { message: "Kun Dushanba, Seshanba, Chorshanba, Payshanba, Juma, Shanba lardan biri bo'lishi kerak"})
    readonly day?: string;

    @IsUUID()
    @IsOptional()
    readonly science_id?: string;

    @IsUUID()
    @IsOptional()
    readonly teacher_id?: string;

    @IsUUID()
    @IsOptional()
    readonly room_id?: string;

    @IsUUID()
    @IsOptional()
    readonly time_id?: string;

    @IsArray()
    @IsOptional()
    @IsUUID(undefined, { each: true })
    readonly groups: string[];
}