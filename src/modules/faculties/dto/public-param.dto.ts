import { IsString, IsNotEmpty, IsUUID } from "class-validator"
export class FacultyPublicParamDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    readonly university_id: string
}