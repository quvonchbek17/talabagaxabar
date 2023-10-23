import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUniversityDto {
    @ApiProperty({name: "name", type: "string", required: true, example: "O'zbekiston Milliy Universiteti"})
    @IsString()
    readonly name: string;

}
