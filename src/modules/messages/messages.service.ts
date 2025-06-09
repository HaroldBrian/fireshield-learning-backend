import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Message, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto, senderId: number): Promise<Message> {
    const { receiverId, content } = createMessageDto;

    // Check if receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    return this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    userId?: number;
    conversationWith?: number;
  } = {}): Promise<Message[]> {
    const { skip, take, userId, conversationWith } = params;
    
    let where: Prisma.MessageWhereInput = {};

    if (userId && conversationWith) {
      // Get conversation between two users
      where = {
        OR: [
          { senderId: userId, receiverId: conversationWith },
          { senderId: conversationWith, receiverId: userId },
        ],
      };
    } else if (userId) {
      // Get all messages for a user
      where = {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      };
    }

    return this.prisma.message.findMany({
      skip,
      take,
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number): Promise<Message | null> {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is part of this conversation
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return message;
  }

  async markAsRead(id: number, userId: number): Promise<Message> {
    const message = await this.findOne(id, userId);
    
    // Only receiver can mark message as read
    if (message.receiverId !== userId) {
      throw new ForbiddenException('Only receiver can mark message as read');
    }

    return this.prisma.message.update({
      where: { id },
      data: { read: true },
    });
  }

  async getUserConversations(userId: number): Promise<any[]> {
    // Get unique conversations for a user
    const conversations = await this.prisma.$queryRaw`
      SELECT DISTINCT
        CASE 
          WHEN sender_id = ${userId} THEN receiver_id
          ELSE sender_id
        END as other_user_id,
        MAX(sent_at) as last_message_time
      FROM messages
      WHERE sender_id = ${userId} OR receiver_id = ${userId}
      GROUP BY other_user_id
      ORDER BY last_message_time DESC
    `;

    // Get user details for each conversation
    const conversationsWithUsers = await Promise.all(
      (conversations as any[]).map(async (conv) => {
        const otherUser = await this.prisma.user.findUnique({
          where: { id: conv.other_user_id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        });

        // Get last message
        const lastMessage = await this.prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: conv.other_user_id },
              { senderId: conv.other_user_id, receiverId: userId },
            ],
          },
          orderBy: { sentAt: 'desc' },
        });

        // Get unread count
        const unreadCount = await this.prisma.message.count({
          where: {
            senderId: conv.other_user_id,
            receiverId: userId,
            read: false,
          },
        });

        return {
          otherUser,
          lastMessage,
          unreadCount,
          lastMessageTime: conv.last_message_time,
        };
      }),
    );

    return conversationsWithUsers;
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.prisma.message.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });
  }

  async markConversationAsRead(userId: number, otherUserId: number): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    });
  }
}