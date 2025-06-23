import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString, IsPositive } from 'class-validator';
import { AuthProvider } from '@prisma/client';

export class CreateAuthProviderDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  userId: number;

  @ApiProperty({
    description: 'Authentication provider',
    enum: AuthProvider,
    example: AuthProvider.google,
  })
  @IsEnum(AuthProvider)
  provider: AuthProvider;

  @ApiProperty({
    description: 'Provider user ID',
    example: 'google_user_123456',
  })
  @IsString()
  providerId: string;
}