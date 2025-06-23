import { ApiProperty } from '@nestjs/swagger';
import { 
  IsInt, 
  IsPositive, 
  IsEnum, 
  IsString, 
  IsOptional, 
  IsUrl,
  MinLength,
  MaxLength 
} from 'class-validator';
import { ContentType } from '@prisma/client';

export class CreateCourseContentDto {
  @ApiProperty({
    description: 'Course ID',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  courseId: number;

  @ApiProperty({
    description: 'Content type',
    enum: ContentType,
    example: ContentType.video,
  })
  @IsEnum(ContentType)
  type: ContentType;

  @ApiProperty({
    description: 'Content title',
    example: 'Introduction to React Hooks',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Content URL or text content',
    example: 'https://example.com/video.mp4',
    required: false,
  })
  @IsOptional()
  @IsString()
  contentUrl?: string;

  @ApiProperty({
    description: 'Order index for content sequence',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  orderIndex: number;
}