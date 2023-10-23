import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNumber, IsString, Length, MaxLength } from 'class-validator'

export class Sign {
    @IsString()
    @MaxLength(20)
    @ApiProperty({ type: 'string', example: 'eshmat', required: true})
    adminname: string;

    @IsString()
    @MaxLength(20)
    @ApiProperty({ type: 'string', example: '1111', required: true })
    password: string;
}
