import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LearnerProgress, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLearnerProgressDto } from './dto/create-learner-progress.dto';
import { UpdateLearnerProgressDto } from './dto/update-learner-progress.dto';

@Injectable()
export class LearnerProgressService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createLearnerProgressDto: CreateLearnerProgressDto): Promise<LearnerProgress> {
    const { userId, contentId } = createLearnerProgressDto;

    // Check if progress already exists
    const existingProgress = await this.prisma.learnerProgress.findFirst({
      where: {
        userId,
        contentId,
      },
    });

    if (existingProgress) {
      throw new BadRequestException('Progress already exists for this content');
    }

    // Verify content exists
    const content = await this.prisma.courseContent.findUnique({
      where: { id: contentId },
      include: {
        course: true,
      },
    });

    if (!content) {
      throw new NotFoundException('Course content not found');
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const progress = await this.prisma.learnerProgress.create({
      data: {
        ...createLearnerProgressDto,
        completedAt: createLearnerProgressDto.completed ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        content: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Send notification if content is completed
    if (createLearnerProgressDto.completed) {
      await this.notificationsService.createForUser(
        userId,
        'Content Completed',
        `You have completed "${content.title}" in ${content.course.title}`,
      );
    }

    return progress;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LearnerProgressWhereInput;
    orderBy?: Prisma.LearnerProgressOrderByWithRelationInput;
  } = {}): Promise<LearnerProgress[]> {
    const { skip, take, where, orderBy } = params;
    
    return this.prisma.learnerProgress.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        content: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<LearnerProgress | null> {
    const progress = await this.prisma.learnerProgress.findUnique({
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
        content: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!progress) {
      throw new NotFoundException('Learner progress not found');
    }

    return progress;
  }

  async update(id: number, updateLearnerProgressDto: UpdateLearnerProgressDto): Promise<LearnerProgress> {
    const progress = await this.findOne(id);

    const updateData: any = { ...updateLearnerProgressDto };

    // Set completedAt if marking as completed
    if (updateLearnerProgressDto.completed && !progress.completed) {
      updateData.completedAt = new Date();
      
      // Send completion notification
      await this.notificationsService.createForUser(
        progress.userId,
        'Content Completed',
        `You have completed "${progress.content.title}" in ${progress.content.course.title}`,
      );
    } else if (updateLearnerProgressDto.completed === false) {
      updateData.completedAt = null;
    }

    return this.prisma.learnerProgress.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        content: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: number): Promise<LearnerProgress> {
    const progress = await this.findOne(id);

    return this.prisma.learnerProgress.delete({
      where: { id },
    });
  }

  async findByUser(userId: number): Promise<LearnerProgress[]> {
    return this.findAll({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    });
  }

  async findByContent(contentId: number): Promise<LearnerProgress[]> {
    return this.findAll({
      where: { contentId },
      orderBy: { completedAt: 'desc' },
    });
  }

  async findByUserAndCourse(userId: number, courseId: number): Promise<LearnerProgress[]> {
    return this.findAll({
      where: {
        userId,
        content: {
          courseId,
        },
      },
      orderBy: { content: { orderIndex: 'asc' } },
    });
  }

  async markContentCompleted(userId: number, contentId: number): Promise<LearnerProgress> {
    // Check if progress exists
    const existingProgress = await this.prisma.learnerProgress.findFirst({
      where: {
        userId,
        contentId,
      },
    });

    if (existingProgress) {
      return this.update(existingProgress.id, { completed: true });
    } else {
      return this.create({
        userId,
        contentId,
        completed: true,
      });
    }
  }

  async getCourseProgress(userId: number, courseId: number): Promise<{
    totalContents: number;
    completedContents: number;
    progressPercentage: number;
    contents: any[];
  }> {
    // Get all contents for the course
    const courseContents = await this.prisma.courseContent.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
      include: {
        learnerProgress: {
          where: { userId },
        },
      },
    });

    const totalContents = courseContents.length;
    const completedContents = courseContents.filter(
      content => content.learnerProgress.length > 0 && content.learnerProgress[0].completed
    ).length;

    const progressPercentage = totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;

    const contents = courseContents.map(content => ({
      id: content.id,
      title: content.title,
      type: content.type,
      orderIndex: content.orderIndex,
      completed: content.learnerProgress.length > 0 ? content.learnerProgress[0].completed : false,
      completedAt: content.learnerProgress.length > 0 ? content.learnerProgress[0].completedAt : null,
    }));

    return {
      totalContents,
      completedContents,
      progressPercentage,
      contents,
    };
  }

  async getProgressStats(): Promise<{
    totalProgress: number;
    completedProgress: number;
    completionRate: number;
  }> {
    const [totalProgress, completedProgress] = await Promise.all([
      this.prisma.learnerProgress.count(),
      this.prisma.learnerProgress.count({ where: { completed: true } }),
    ]);

    const completionRate = totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0;

    return {
      totalProgress,
      completedProgress,
      completionRate,
    };
  }
}