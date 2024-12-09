import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class IdParamDto {
  @ApiProperty({
    description: 'Resource ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  id: number;
}
