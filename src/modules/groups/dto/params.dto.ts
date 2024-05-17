import {IsUUID } from 'class-validator';

export class GroupParamsIdDto {
    @IsUUID()
    id: string;
}