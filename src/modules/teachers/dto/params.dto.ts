import {IsUUID } from 'class-validator';

export class TeacherParamsIdDto {
    @IsUUID()
    id: string;
}
