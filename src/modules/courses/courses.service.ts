import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Course, CourseLevel, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const { title, ...rest } = createCourseDto;
    
    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    // Check if slug already exists
    const existingCourse = await this.prisma.course.findUnique({
      where: { slug },
    });

    if (existingCourse) {
      throw new BadRequestException('A course with this title already exists');
    }

    return this.prisma.course.create({
      data: {
        title,
        slug,
        ...rest,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CourseWhereUniqueInput;
    where?: Prisma.CourseWhereInput;
    orderBy?: Prisma.CourseOrderByWithRelationInput;
    include?: Prisma.CourseInclude;
  } = {}): Promise<Course[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.course.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }

  async findOne(id: number): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            trainer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                bio: true,
                certifications: true,
              },
            },
            enrollments: {
              select: {
                id: true,
                status: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        contents: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async findBySlug(slug: string): Promise<Course | null> {
    return this.prisma.course.findUnique({
      where: { slug },
      include: {
        sessions: {
          include: {
            trainer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                bio: true,
                certifications: true,
              },
            },
          },
        },
        contents: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const updateData: any = { ...updateCourseDto };

    // Update slug if title is being updated
    if (updateCourseDto.title) {
      const newSlug = updateCourseDto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Check if new slug conflicts with existing courses (excluding current)
      const existingCourse = await this.prisma.course.findFirst({
        where: {
          slug: newSlug,
          NOT: { id },
        },
      });

      if (existingCourse) {
        throw new BadRequestException('A course with this title already exists');
      }

      updateData.slug = newSlug;
    }

    return this.prisma.course.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number): Promise<Course> {
    const course = await this.findOne(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }

  async getCoursesByLevel(level: CourseLevel): Promise<Course[]> {
    return this.findAll({
      where: { level },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchCourses(query: string): Promise<Course[]> {
    return this.findAll({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCourseStats(): Promise<{
    total: number;
    byLevel: Record<CourseLevel, number>;
    totalRevenue: number;
  }> {
    const [total, beginnerCount, intermediateCount, advancedCount, revenueResult] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.count({ where: { level: CourseLevel.beginner } }),
      this.prisma.course.count({ where: { level: CourseLevel.intermediate } }),
      this.prisma.course.count({ where: { level: CourseLevel.advanced } }),
      this.prisma.course.aggregate({
        _sum: { price: true },
      }),
    ]);

    return {
      total,
      byLevel: {
        beginner: beginnerCount,
        intermediate: intermediateCount,
        advanced: advancedCount,
      },
      totalRevenue: Number(revenueResult._sum.price) || 0,
    };
  }
}