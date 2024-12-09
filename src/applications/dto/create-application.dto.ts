import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ description: 'Job ID to apply for' })
  @IsNumber()
  jobId: number;
} 
