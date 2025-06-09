import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Enrollment, EnrollmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto, userId: number): Promise<Enrollment> {
    const { sessionId } = createEnrollmentDto;

    // Check if user is already enrolled in this session
    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        sessionId,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('Already enrolled in this session');
    }

    // Get session details for email
    const session = await this.prisma.courseSession.findUnique({
      where: { id: sessionId },
      include: {
        course: true,
        trainer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Create enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        sessionId,
        status: EnrollmentStatus.pending,
      },
      include: {
        user: true,
        session: {
          include: {
            course: true,
            trainer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Send enrollment confirmation email
    await this.emailService.sendEnrollmentConfirmationEmail(
      enrollment.user.email,
      enrollment.user.firstName,
      session.course.title,
      {
        startDate: session.startDate.toLocaleDateString(),
        endDate: session.endDate.toLocaleDateString(),
        location: session.location,
        trainerName: `${session.trainer.firstName} ${session.trainer.lastName}`,
        courseSlug: session.course.slug,
      },
    );

    return enrollment;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    userId?: number;
    sessionId?: number;
    status?: EnrollmentStatus;
  } = {}): Promise<Enrollment[]> {
    const { skip, take, userId, sessionId, status } = params;
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (sessionId) where.sessionId = sessionId;
    if (status) where.status = status;

    return this.prisma.enrollment.findMany({
      skip,
      take,
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        session: {
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
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Enrollment | null> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        session: {
          include: {
            course: true,
            trainer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        payments: true,
        certificate: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  async update(id: number, updateEnrollmentDto: UpdateEnrollmentDto): Promise<Enrollment> {
    const enrollment = await this.findOne(id);
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return this.prisma.enrollment.update({
      where: { id },
      data: updateEnrollmentDto,
    });
  }

  async remove(id: number): Promise<Enrollment> {
    const enrollment = await this.findOne(id);
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return this.prisma.enrollment.delete({
      where: { id },
    });
  }

  async getUserEnrollments(userId: number): Promise<Enrollment[]> {
    return this.findAll({ userId });
  }

  async getSessionEnrollments(sessionId: number): Promise<Enrollment[]> {
    return this.findAll({ sessionId });
  }

  async confirmEnrollment(id: number): Promise<Enrollment> {
    return this.update(id, { status: EnrollmentStatus.confirmed });
  }

  async cancelEnrollment(id: number): Promise<Enrollment> {
    return this.update(id, { status: EnrollmentStatus.canceled });
  }

  async getEnrollmentStats(): Promise<{
    total: number;
    byStatus: Record<EnrollmentStatus, number>;
  }> {
    const [total, pendingCount, confirmedCount, canceledCount] = await Promise.all([
      this.prisma.enrollment.count(),
      this.prisma.enrollment.count({ where: { status: EnrollmentStatus.pending } }),
      this.prisma.enrollment.count({ where: { status: EnrollmentStatus.confirmed } }),
      this.prisma.enrollment.count({ where: { status: EnrollmentStatus.canceled } }),
    ]);

    return {
      total,
      byStatus: {
        pending: pendingCount,
        confirmed: confirmedCount,
        canceled: canceledCount,
      },
    };
  }
}