import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateUniversityDto {
    @ApiProperty({name: "id", type: "string", required: true, example: "88a9e3da-1240-48e5-b613-fe5cffe4f6a7"})
    @IsString()
    readonly id: string;

    @ApiProperty({name: "name", type: "string", required: false, example: "Texnika Universiteti"})
    @IsString()
    readonly name: string;
}
