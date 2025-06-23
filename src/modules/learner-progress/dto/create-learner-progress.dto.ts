import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsBoolean, IsOptional } from 'class-validator';

export class CreateLearnerProgressDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  userId: number;

  @ApiProperty({
    description: 'Content ID',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  contentId: number;

  @ApiProperty({
    description: 'Completion status',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}