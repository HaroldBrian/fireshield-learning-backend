import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsEnum, 
  IsDecimal, 
  IsOptional, 
  MinLength, 
  MaxLength,
  IsUrl,
  Min
} from 'class-validator';
import { CourseLevel } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'Advanced React Development',
    minLength: 5,
    maxLength: 255,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Course description',
    example: 'Learn advanced React concepts including hooks, context, and performance optimization',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description: 'Course difficulty level',
    enum: CourseLevel,
    example: CourseLevel.intermediate,
  })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({
    description: 'Course price',
    example: 99.99,
    minimum: 0,
  })
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Course duration',
    example: '8 weeks',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  duration?: string;

  @ApiProperty({
    description: 'Course thumbnail URL',
    example: 'https://example.com/course-thumbnail.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;
}