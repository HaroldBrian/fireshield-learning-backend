import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  async createForUser(
    userId: number,
    title: string,
    message: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      title,
      message,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    userId?: number;
    isRead?: boolean;
  } = {}): Promise<Notification[]> {
    const { skip, take, userId, isRead } = params;
    
    const where: Prisma.NotificationWhereInput = {};
    if (userId) where.userId = userId;
    if (isRead !== undefined) where.isRead = isRead;

    return this.prisma.notification.findMany({
      skip,
      take,
      where,
      orderBy: { sentAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async remove(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.findAll({ userId });
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return this.findAll({ userId, isRead: false });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  // Helper methods for creating specific notification types
  async notifyEnrollmentConfirmed(userId: number, courseName: string): Promise<Notification> {
    return this.createForUser(
      userId,
      'Enrollment Confirmed',
      `Your enrollment in "${courseName}" has been confirmed!`,
    );
  }

  async notifyNewMessage(userId: number, senderName: string): Promise<Notification> {
    return this.createForUser(
      userId,
      'New Message',
      `You have a new message from ${senderName}`,
    );
  }

  async notifyCourseStarting(userId: number, courseName: string, startDate: Date): Promise<Notification> {
    return this.createForUser(
      userId,
      'Course Starting Soon',
      `Your course "${courseName}" starts on ${startDate.toLocaleDateString()}`,
    );
  }

  async notifyCertificateEarned(userId: number, courseName: string): Promise<Notification> {
    return this.createForUser(
      userId,
      'Certificate Earned!',
      `Congratulations! You've earned a certificate for "${courseName}"`,
    );
  }
}