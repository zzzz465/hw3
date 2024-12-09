import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  currentPassword: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  @MaxLength(20, { message: 'New password must not exceed 20 characters' })
  newPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name?: string;
}
