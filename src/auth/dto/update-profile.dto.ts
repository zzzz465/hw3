import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'New password (6-20 characters)',
    required: false,
    minLength: 6,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  @MaxLength(20, { message: 'New password must not exceed 20 characters' })
  newPassword?: string;

  @ApiProperty({
    description: 'New name (2-50 characters)',
    required: false,
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name?: string;
}
