import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ description: 'Job title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiProperty({ description: 'Job location' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'Required career level' })
  @IsString()
  @IsNotEmpty()
  career: string;

  @ApiProperty({ description: 'Required education level' })
  @IsString()
  @IsNotEmpty()
  education: string;

  @ApiProperty({ description: 'Salary range' })
  @IsString()
  @IsNotEmpty()
  salary: string;

  @ApiProperty({ description: 'Job sectors (comma-separated)' })
  @IsString()
  @IsNotEmpty()
  sectors: string;

  @ApiProperty({ description: 'Position type' })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({ description: 'Required tech stack (comma-separated)' })
  @IsString()
  @IsNotEmpty()
  techStack: string;

  @ApiProperty({ description: 'Original job posting URL' })
  @IsString()
  @IsNotEmpty()
  link: string;
} 
