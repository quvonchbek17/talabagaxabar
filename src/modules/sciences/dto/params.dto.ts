import {IsUUID } from 'class-validator';

export class ScienceParamsIdDto {
    @IsUUID()
    id: string;
}
