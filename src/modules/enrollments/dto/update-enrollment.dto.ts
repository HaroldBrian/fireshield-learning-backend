import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';

export class UpdateEnrollmentDto {
  @ApiProperty({
    description: 'Enrollment status',
    enum: EnrollmentStatus,
    example: EnrollmentStatus.confirmed,
    required: false,
  })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}