import {IsUUID, IsArray } from "class-validator";

export class CreateSchedulePdfDto {
    @IsArray()
    @IsUUID(undefined, { each: true })
    readonly groups: string[];
}