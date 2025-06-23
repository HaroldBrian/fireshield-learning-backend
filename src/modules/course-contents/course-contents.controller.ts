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
import { UserRole, ContentType } from '@prisma/client';

import { CourseContentsService } from './course-contents.service';
import { CreateCourseContentDto } from './dto/create-course-content.dto';
import { UpdateCourseContentDto } from './dto/update-course-content.dto';
import { ReorderContentDto } from './dto/reorder-content.dto';
import { Roles } from '../../common/decorators/auth.decorator';

@ApiTags('Course Contents')
@ApiBearerAuth('JWT-auth')
@Controller('course-contents')
export class CourseContentsController {
  constructor(private readonly courseContentsService: CourseContentsService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.trainer)
  @ApiOperation({ summary: 'Create course content (Admin and Trainer only)' })
  @ApiResponse({ status: 201, description: 'Course content created successfully' })
  create(@Body() createCourseContentDto: CreateCourseContentDto) {
    return this.courseContentsService.create(createCourseContentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all course contents' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ContentType })
  @ApiResponse({ status: 200, description: 'Course contents retrieved successfully' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('courseId') courseId?: number,
    @Query('type') type?: ContentType,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (courseId) where.courseId = courseId;
    if (type) where.type = type;

    return this.courseContentsService.findAll({
      skip,
      take: limit,
      where,
      orderBy: { orderIndex: 'asc' },
    });
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get contents by course ID' })
  @ApiResponse({ status: 200, description: 'Course contents retrieved successfully' })
  findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.courseContentsService.findByCourse(courseId);
  }

  @Get('stats')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get content statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Content statistics retrieved successfully' })
  getStats() {
    return this.courseContentsService.getContentStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course content by ID' })
  @ApiResponse({ status: 200, description: 'Course content retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course content not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseContentsService.findOne(id);
  }

  @Patch('reorder/:courseId')
  @Roles(UserRole.admin, UserRole.trainer)
  @ApiOperation({ summary: 'Reorder course contents (Admin and Trainer only)' })
  @ApiResponse({ status: 200, description: 'Contents reordered successfully' })
  reorderContents(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() reorderContentDto: ReorderContentDto,
  ) {
    return this.courseContentsService.reorderContent(courseId, reorderContentDto.contentOrders);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.trainer)
  @ApiOperation({ summary: 'Update course content (Admin and Trainer only)' })
  @ApiResponse({ status: 200, description: 'Course content updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseContentDto: UpdateCourseContentDto,
  ) {
    return this.courseContentsService.update(id, updateCourseContentDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.trainer)
  @ApiOperation({ summary: 'Delete course content (Admin and Trainer only)' })
  @ApiResponse({ status: 200, description: 'Course content deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseContentsService.remove(id);
  }
}