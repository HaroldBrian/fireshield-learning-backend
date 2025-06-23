import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CourseSession, SessionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseSessionDto } from './dto/create-course-session.dto';
import { UpdateCourseSessionDto } from './dto/update-course-session.dto';

@Injectable()
export class CourseSessionsService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseSessionDto: CreateCourseSessionDto): Promise<CourseSession> {
    const { courseId, trainerId, startDate, endDate } = createCourseSessionDto;

    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Verify trainer exists and has trainer role
    const trainer = await this.prisma.user.findUnique({
      where: { id: trainerId },
    });

    if (!trainer || trainer.role !== 'trainer') {
      throw new BadRequestException('Invalid trainer');
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    return this.prisma.courseSession.create({
      data: createCourseSessionDto,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
          },
        },
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            bio: true,
          },
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CourseSessionWhereInput;
    orderBy?: Prisma.CourseSessionOrderByWithRelationInput;
  } = {}): Promise<CourseSession[]> {
    const { skip, take, where, orderBy } = params;
    
    return this.prisma.courseSession.findMany({
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
            thumbnailUrl: true,
          },
        },
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
    });
  }

  async findOne(id: number): Promise<CourseSession | null> {
    const session = await this.prisma.courseSession.findUnique({
      where: { id },
      include: {
        course: true,
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
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        evaluations: {
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

    if (!session) {
      throw new NotFoundException('Course session not found');
    }

    return session;
  }

  async update(id: number, updateCourseSessionDto: UpdateCourseSessionDto): Promise<CourseSession> {
    const session = await this.findOne(id);

    // Validate dates if provided
    if (updateCourseSessionDto.startDate && updateCourseSessionDto.endDate) {
      if (new Date(updateCourseSessionDto.startDate) >= new Date(updateCourseSessionDto.endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    return this.prisma.courseSession.update({
      where: { id },
      data: updateCourseSessionDto,
      include: {
        course: true,
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: number): Promise<CourseSession> {
    const session = await this.findOne(id);

    return this.prisma.courseSession.delete({
      where: { id },
    });
  }

  async findByTrainer(trainerId: number): Promise<CourseSession[]> {
    return this.findAll({
      where: { trainerId },
      orderBy: { startDate: 'desc' },
    });
  }

  async findByCourse(courseId: number): Promise<CourseSession[]> {
    return this.findAll({
      where: { courseId },
      orderBy: { startDate: 'desc' },
    });
  }

  async updateStatus(id: number, status: SessionStatus): Promise<CourseSession> {
    return this.update(id, { status });
  }

  async getSessionStats(): Promise<{
    total: number;
    byStatus: Record<SessionStatus, number>;
  }> {
    const [total, plannedCount, ongoingCount, completedCount, canceledCount] = await Promise.all([
      this.prisma.courseSession.count(),
      this.prisma.courseSession.count({ where: { status: SessionStatus.planned } }),
      this.prisma.courseSession.count({ where: { status: SessionStatus.ongoing } }),
      this.prisma.courseSession.count({ where: { status: SessionStatus.completed } }),
      this.prisma.courseSession.count({ where: { status: SessionStatus.canceled } }),
    ]);

    return {
      total,
      byStatus: {
        planned: plannedCount,
        ongoing: ongoingCount,
        completed: completedCount,
        canceled: canceledCount,
      },
    };
  }
}