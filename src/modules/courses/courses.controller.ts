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
import { UserRole, CourseLevel } from '@prisma/client';

import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Roles } from '../../common/decorators/auth.decorator';

@ApiTags('Courses')
@ApiBearerAuth('JWT-auth')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.trainer)
  @ApiOperation({ summary: 'Create a new course (Admin and Trainer only)' })
  @ApiResponse({ status: 201, description: 'Course successfully created' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Trainer access required' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'level', required: false, enum: CourseLevel })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('level') level?: CourseLevel,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.coursesService.searchCourses(search);
    }

    const skip = (page - 1) * limit;
    return this.coursesService.findAll({
      skip,
      take: limit,
      where: level ? { level } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('stats')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get course statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Course statistics retrieved successfully' })
  getStats() {
    return this.coursesService.getCourseStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get course by slug' })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.trainer)
  @ApiOperation({ summary: 'Update course by ID (Admin and Trainer only)' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Trainer access required' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Delete course by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}