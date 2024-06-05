import { IsString, IsNotEmpty, IsUUID } from "class-validator"
export class SchedulePublicParamDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    readonly group_id: string
}