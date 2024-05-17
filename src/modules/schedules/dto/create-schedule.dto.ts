import { IsNotEmpty, IsString, IsIn, IsUUID, IsArray } from "class-validator";

export class CreateScheduleDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'], { message: "Kun Dushanba, Seshanba, Chorshanba, Payshanba, Juma, Shanba lardan biri bo'lishi kerak"})
    readonly day: string;

    @IsUUID()
    readonly science_id: string;

    @IsUUID()
    readonly teacher_id: string;

    @IsUUID()
    readonly room_id: string;

    @IsUUID()
    readonly time_id: string;

    @IsArray()
    @IsUUID(undefined, { each: true })
    readonly groups: string[];
}