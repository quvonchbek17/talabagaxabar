import {IsUUID } from 'class-validator';

export class EducationParamsIdDto {
    @IsUUID()
    id: string;
}
