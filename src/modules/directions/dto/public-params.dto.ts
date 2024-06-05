import { IsString, IsNotEmpty, IsUUID } from "class-validator"
export class DirectionPublicParamDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    readonly faculty_id: string
}