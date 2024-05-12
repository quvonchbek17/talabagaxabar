import {IsUUID } from 'class-validator';

export class RoomParamsIdDto {
    @IsUUID()
    id: string;
}
