import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({
    description: 'Course session ID to enroll in',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  sessionId: number;
}