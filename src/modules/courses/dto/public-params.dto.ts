import { IsString, IsNotEmpty, IsUUID } from "class-validator"
export class CoursePublicParamDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    readonly faculty_id: string
}