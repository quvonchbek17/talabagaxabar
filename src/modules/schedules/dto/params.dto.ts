import {IsUUID } from 'class-validator';

export class ScheduleParamsIdDto {
    @IsUUID()
    id: string;
}
