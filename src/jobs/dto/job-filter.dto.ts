import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class JobFilterDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  pageSize?: number;

  @ApiPropertyOptional({ description: 'Filter by location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Filter by career level' })
  @IsOptional()
  @IsString()
  career?: string;

  @ApiPropertyOptional({ description: 'Filter by education level' })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiPropertyOptional({ description: 'Filter by salary range' })
  @IsOptional()
  @IsString()
  salary?: string;

  @ApiPropertyOptional({ description: 'Filter by job sectors' })
  @IsOptional()
  @IsString()
  sectors?: string;

  @ApiPropertyOptional({ description: 'Search in job title' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by company name' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'Filter by position' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: 'Filter by tech stack' })
  @IsOptional()
  @IsString()
  techStack?: string;
} 
