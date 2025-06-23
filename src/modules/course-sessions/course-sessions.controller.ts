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
import { UserRole, SessionStatus } from '@prisma/client';

import { CourseSessionsService } from './course-sessions.service';
import { CreateCourseSessionDto } from './dto/create-course-session.dto';
import { UpdateCourseSessionDto } from './dto/update-course-session.dto';
import { Roles } from '../../common/decorators/auth.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('Course Sessions')
@ApiBearerAuth('JWT-auth')
@Controller('course-sessions')
export class CourseSessionsController {
  constructor(private readonly courseSessionsService: CourseSessionsService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.trainer)
  @ApiOperation({ summary: 'Create a new course session (Admin and Trainer only)' })
  @ApiResponse({ status: 201, description: 'Course session created successfully' })
  create(@Body() createCourseSessionDto: CreateCourseSessionDto) {
    return this.courseSessionsService.create(createCourseSessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all course sessions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: SessionStatus })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiQuery({ name: 'trainerId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Course sessions retrieved successfully' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: SessionStatus,
    @Query('courseId') courseId?: number,
    @Query('trainerId') trainerId?: number,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (status) where.status = status;
    if (courseId) where.courseId = courseId;
    if (trainerId) where.trainerId = trainerId;

    return this.courseSessionsService.findAll({
      skip,
      take: limit,
      where,
      orderBy: { startDate: 'desc' },
    });
  }

  @Get('my-sessions')
  @Roles(UserRole.trainer)
  @ApiOperation({ summary: 'Get trainer sessions (Trainer only)' })
  @ApiResponse({ status: 200, description: 'Trainer sessions retrieved successfully' })
  getMyTrainerSessions(@CurrentUser() user: CurrentUserData) {
    return this.courseSessionsService.findByTrainer(user.id);
  }

  @Get('stats')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get session statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Session statistics retrieved successfully' })
  getStats() {
    return this.courseSessionsService.getSessionStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course session by ID' })
  @ApiResponse({ status: 200, description: 'Course session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course session not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseSessionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.trainer)
  @ApiOperation({ summary: 'Update course session (Admin and Trainer only)' })
  @ApiResponse({ status: 200, description: 'Course session updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseSessionDto: UpdateCourseSessionDto,
  ) {
    return this.courseSessionsService.update(id, updateCourseSessionDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.admin, UserRole.trainer)
  @ApiOperation({ summary: 'Update session status (Admin and Trainer only)' })
  @ApiResponse({ status: 200, description: 'Session status updated successfully' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: SessionStatus,
  ) {
    return this.courseSessionsService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Delete course session (Admin only)' })
  @ApiResponse({ status: 200, description: 'Course session deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseSessionsService.remove(id);
  }
}