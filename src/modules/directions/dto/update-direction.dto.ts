import { PartialType } from '@nestjs/swagger';
import { CreateDirectionDto } from './create-direction.dto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateDirectionDto extends PartialType(CreateDirectionDto) {}


export class DirectionParamsIdDto {

    @IsString()
    @IsNotEmpty()
    @IsUUID()
    readonly id: string
}