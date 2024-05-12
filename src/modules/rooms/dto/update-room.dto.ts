
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateRoomDto{
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    readonly name: string;

    @IsInt()
    @Min(1)
    @IsOptional()
    readonly capacity: number

    @IsInt()
    @IsOptional()
    readonly floor: number
}
