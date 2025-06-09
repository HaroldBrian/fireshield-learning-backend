import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  } = {}): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        role: true,
        bio: true,
        certifications: true,
        createdAt: true,
        updatedAt: true,
        password: false,
        otp: false,
      },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return this.findAll({
      where: { role },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserStats(): Promise<{
    total: number;
    byRole: Record<UserRole, number>;
  }> {
    const [total, adminCount, trainerCount, learnerCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.admin } }),
      this.prisma.user.count({ where: { role: UserRole.trainer } }),
      this.prisma.user.count({ where: { role: UserRole.learner } }),
    ]);

    return {
      total,
      byRole: {
        admin: adminCount,
        trainer: trainerCount,
        learner: learnerCount,
      },
    };
  }

  private excludePassword(user: User): Omit<User, 'password' | 'otp'> {
    const { password, otp, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}