import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class CreateDepartmentDto {
    @ApiProperty({name: "name", type: "string", required: true, example: "Hisoblash matematikasi"})
    @IsString()
    readonly name: string;

    @ApiProperty({name: "faculty_id", type: "string", required: true, example: "88a9e3da-1240-48e5-b613-fe5cffe4f6a7"})
    @IsString()
    @IsUUID()
    readonly faculty_id: string;
}
