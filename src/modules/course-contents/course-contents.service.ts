import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CourseContent, ContentType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseContentDto } from './dto/create-course-content.dto';
import { UpdateCourseContentDto } from './dto/update-course-content.dto';

@Injectable()
export class CourseContentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseContentDto: CreateCourseContentDto): Promise<CourseContent> {
    const { courseId, orderIndex } = createCourseContentDto;

    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if order index already exists for this course
    const existingContent = await this.prisma.courseContent.findFirst({
      where: {
        courseId,
        orderIndex,
      },
    });

    if (existingContent) {
      throw new BadRequestException('Content with this order index already exists for this course');
    }

    return this.prisma.courseContent.create({
      data: createCourseContentDto,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CourseContentWhereInput;
    orderBy?: Prisma.CourseContentOrderByWithRelationInput;
  } = {}): Promise<CourseContent[]> {
    const { skip, take, where, orderBy } = params;
    
    return this.prisma.courseContent.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<CourseContent | null> {
    const content = await this.prisma.courseContent.findUnique({
      where: { id },
      include: {
        course: true,
        learnerProgress: {
          include: {
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
    });

    if (!content) {
      throw new NotFoundException('Course content not found');
    }

    return content;
  }

  async update(id: number, updateCourseContentDto: UpdateCourseContentDto): Promise<CourseContent> {
    const content = await this.findOne(id);

    // If updating order index, check for conflicts
    if (updateCourseContentDto.orderIndex && updateCourseContentDto.orderIndex !== content.orderIndex) {
      const existingContent = await this.prisma.courseContent.findFirst({
        where: {
          courseId: content.courseId,
          orderIndex: updateCourseContentDto.orderIndex,
          NOT: { id },
        },
      });

      if (existingContent) {
        throw new BadRequestException('Content with this order index already exists for this course');
      }
    }

    return this.prisma.courseContent.update({
      where: { id },
      data: updateCourseContentDto,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  async remove(id: number): Promise<CourseContent> {
    const content = await this.findOne(id);

    return this.prisma.courseContent.delete({
      where: { id },
    });
  }

  async findByCourse(courseId: number): Promise<CourseContent[]> {
    return this.findAll({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findByType(type: ContentType): Promise<CourseContent[]> {
    return this.findAll({
      where: { type },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async reorderContent(courseId: number, contentOrders: { id: number; orderIndex: number }[]): Promise<void> {
    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Update each content's order index
    await Promise.all(
      contentOrders.map(({ id, orderIndex }) =>
        this.prisma.courseContent.update({
          where: { id },
          data: { orderIndex },
        }),
      ),
    );
  }

  async getContentStats(): Promise<{
    total: number;
    byType: Record<ContentType, number>;
  }> {
    const [total, pdfCount, videoCount, quizCount, urlCount, textCount] = await Promise.all([
      this.prisma.courseContent.count(),
      this.prisma.courseContent.count({ where: { type: ContentType.pdf } }),
      this.prisma.courseContent.count({ where: { type: ContentType.video } }),
      this.prisma.courseContent.count({ where: { type: ContentType.quiz } }),
      this.prisma.courseContent.count({ where: { type: ContentType.url } }),
      this.prisma.courseContent.count({ where: { type: ContentType.text } }),
    ]);

    return {
      total,
      byType: {
        pdf: pdfCount,
        video: videoCount,
        quiz: quizCount,
        url: urlCount,
        text: textCount,
      },
    };
  }
}