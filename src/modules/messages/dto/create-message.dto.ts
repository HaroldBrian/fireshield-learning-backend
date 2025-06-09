import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsPositive, MinLength, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'ID of the message receiver',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  receiverId: number;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, I have a question about the course...',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;
}