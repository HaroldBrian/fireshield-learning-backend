import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches, IsInt, Min, Max } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'OTP code received via email',
    example: 123456,
    minimum: 100000,
    maximum: 999999,
  })
  @IsInt()
  @Min(100000)
  @Max(999999)
  otp: number;

  @ApiProperty({
    description: 'New password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    example: 'NewStrongPass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  newPassword: string;
}