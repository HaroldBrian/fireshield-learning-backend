import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserRole, EnrollmentStatus } from '@prisma/client';

import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Roles } from '../../common/decorators/auth.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('Enrollments')
@ApiBearerAuth('JWT-auth')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Enroll in a course session' })
  @ApiResponse({ status: 201, description: 'Successfully enrolled in session' })
  @ApiResponse({ status: 400, description: 'Already enrolled or invalid session' })
  create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.enrollmentsService.create(createEnrollmentDto, user.id);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.trainer)
  @ApiOperation({ summary: 'Get all enrollments (Admin and Trainer only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: EnrollmentStatus })
  @ApiQuery({ name: 'sessionId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved successfully' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: EnrollmentStatus,
    @Query('sessionId') sessionId?: number,
  ) {
    const skip = (page - 1) * limit;
    return this.enrollmentsService.findAll({
      skip,
      take: limit,
      status,
      sessionId,
    });
  }

  @Get('my-enrollments')
  @ApiOperation({ summary: 'Get current user enrollments' })
  @ApiResponse({ status: 200, description: 'User enrollments retrieved successfully' })
  getMyEnrollments(@CurrentUser() user: CurrentUserData) {
    return this.enrollmentsService.getUserEnrollments(user.id);
  }

  @Get('stats')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get enrollment statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Enrollment statistics retrieved successfully' })
  getStats() {
    return this.enrollmentsService.getEnrollmentStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiResponse({ status: 200, description: 'Enrollment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id/confirm')
  @Roles(UserRole.admin, UserRole.trainer)
  @ApiOperation({ summary: 'Confirm enrollment (Admin and Trainer only)' })
  @ApiResponse({ status: 200, description: 'Enrollment confirmed successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  confirmEnrollment(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.confirmEnrollment(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment canceled successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  cancelEnrollment(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.cancelEnrollment(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.trainer)
  @ApiOperation({ summary: 'Update enrollment (Admin and Trainer only)' })
  @ApiResponse({ status: 200, description: 'Enrollment updated successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Delete enrollment (Admin only)' })
  @ApiResponse({ status: 200, description: 'Enrollment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}