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
import { UserRole } from '@prisma/client';

import { LearnerProgressService } from './learner-progress.service';
import { CreateLearnerProgressDto } from './dto/create-learner-progress.dto';
import { UpdateLearnerProgressDto } from './dto/update-learner-progress.dto';
import { Roles } from '../../common/decorators/auth.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('Learner Progress')
@ApiBearerAuth('JWT-auth')
@Controller('learner-progress')
export class LearnerProgressController {
  constructor(private readonly learnerProgressService: LearnerProgressService) {}

  @Post()
  @ApiOperation({ summary: 'Create learner progress' })
  @ApiResponse({ status: 201, description: 'Progress created successfully' })
  create(@Body() createLearnerProgressDto: CreateLearnerProgressDto) {
    return this.learnerProgressService.create(createLearnerProgressDto);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.trainer)
  @ApiOperation({ summary: 'Get all learner progress (Admin and Trainer only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'contentId', required: false, type: Number })
  @ApiQuery({ name: 'completed', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Progress retrieved successfully' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('userId') userId?: number,
    @Query('contentId') contentId?: number,
    @Query('completed') completed?: boolean,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (userId) where.userId = userId;
    if (contentId) where.contentId = contentId;
    if (completed !== undefined) where.completed = completed;

    return this.learnerProgressService.findAll({
      skip,
      take: limit,
      where,
      orderBy: { completedAt: 'desc' },
    });
  }

  @Get('my-progress')
  @ApiOperation({ summary: 'Get current user progress' })
  @ApiResponse({ status: 200, description: 'User progress retrieved successfully' })
  getMyProgress(@CurrentUser() user: CurrentUserData) {
    return this.learnerProgressService.findByUser(user.id);
  }

  @Get('course/:courseId/progress')
  @ApiOperation({ summary: 'Get course progress for current user' })
  @ApiResponse({ status: 200, description: 'Course progress retrieved successfully' })
  getCourseProgress(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.learnerProgressService.getCourseProgress(user.id, courseId);
  }

  @Get('stats')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get progress statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Progress statistics retrieved successfully' })
  getStats() {
    return this.learnerProgressService.getProgressStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get progress by ID' })
  @ApiResponse({ status: 200, description: 'Progress retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Progress not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.learnerProgressService.findOne(id);
  }

  @Post('complete/:contentId')
  @ApiOperation({ summary: 'Mark content as completed' })
  @ApiResponse({ status: 200, description: 'Content marked as completed' })
  markCompleted(
    @Param('contentId', ParseIntPipe) contentId: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.learnerProgressService.markContentCompleted(user.id, contentId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update progress' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLearnerProgressDto: UpdateLearnerProgressDto,
  ) {
    return this.learnerProgressService.update(id, updateLearnerProgressDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Delete progress (Admin only)' })
  @ApiResponse({ status: 200, description: 'Progress deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.learnerProgressService.remove(id);
  }
}