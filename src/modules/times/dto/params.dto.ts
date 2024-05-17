import {IsUUID } from 'class-validator';

export class TimeParamsIdDto {
    @IsUUID()
    id: string;
}
