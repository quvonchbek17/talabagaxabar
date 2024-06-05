import { IsString, IsNotEmpty, IsUUID } from "class-validator"
export class EducationPublicParamDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    readonly faculty_id: string
}