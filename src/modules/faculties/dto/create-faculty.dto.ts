import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class CreateFacultyDto {
    @ApiProperty({name: "name", type: "string", required: true, example: "Matematika"})
    @IsString()
    readonly name: string;

    @ApiProperty({name: "university_id", type: "string", required: true, example: "88a9e3da-1240-48e5-b613-fe5cffe4f6a7"})
    @IsString()
    @IsUUID()
    readonly university_id: string;
}
