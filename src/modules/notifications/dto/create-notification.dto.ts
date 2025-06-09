import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsPositive, MinLength, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID of the user to notify',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  userId: number;

  @ApiProperty({
    description: 'Notification title',
    example: 'Course Starting Soon',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Your course "Advanced React" starts tomorrow at 9:00 AM',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message: string;
}