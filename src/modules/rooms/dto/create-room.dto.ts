import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateRoomDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsInt()
    @Min(1)
    readonly capacity: number

    @IsInt()
    readonly floor: number
}
