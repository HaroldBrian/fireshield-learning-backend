import { ApiProperty } from '@nestjs/swagger';
import { 
  IsInt, 
  IsPositive, 
  IsDateString, 
  IsOptional, 
  IsString, 
  IsEnum,
  MaxLength 
} from 'class-validator';
import { SessionStatus } from '@prisma/client';

export class CreateCourseSessionDto {
  @ApiProperty({
    description: 'Course ID',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  courseId: number;

  @ApiProperty({
    description: 'Trainer ID',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  trainerId: number;

  @ApiProperty({
    description: 'Session start date',
    example: '2024-03-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Session end date',
    example: '2024-03-31',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Session location or meeting link',
    example: 'Room 101 or https://meet.google.com/abc-def-ghi',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiProperty({
    description: 'Session status',
    enum: SessionStatus,
    example: SessionStatus.planned,
    required: false,
  })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;
}