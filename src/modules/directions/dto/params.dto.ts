import { IsString, IsNotEmpty, IsUUID } from "class-validator"
export class DirectionParamsIdDto {

    @IsString()
    @IsNotEmpty()
    @IsUUID()
    readonly id: string
}