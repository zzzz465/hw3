import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ApplicationFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by status (PENDING, CANCELLED)',
    example: 'PENDING',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  status?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value ? parseInt(value) : 1))
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value ? parseInt(value) : 20))
  pageSize?: number;
}
