import {IsUUID } from 'class-validator';

export class DepartmentParamsIdDto {
    @IsUUID()
    id: string;
}
