import {IsUUID } from 'class-validator';

export class CourseParamsIdDto {
    @IsUUID()
    id: string;
}
