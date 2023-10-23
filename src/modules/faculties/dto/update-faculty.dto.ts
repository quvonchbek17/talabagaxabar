import { PartialType } from '@nestjs/swagger';
import { CreateFacultyDto } from './create-faculty.dto';
import { IsUUID } from 'class-validator';

export class UpdateFacultyDto extends PartialType(CreateFacultyDto) {}
export class FacultyParamsIDDto {
    @IsUUID()
    id: string;
}
