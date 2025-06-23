import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthProviderModel, AuthProvider } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuthProviderDto } from './dto/create-auth-provider.dto';

@Injectable()
export class AuthProvidersService {
  constructor(private prisma: PrismaService) {}

  async create(createAuthProviderDto: CreateAuthProviderDto): Promise<AuthProviderModel> {
    return this.prisma.authProviderModel.create({
      data: createAuthProviderDto,
    });
  }

  async findByUser(userId: number): Promise<AuthProviderModel[]> {
    return this.prisma.authProviderModel.findMany({
      where: { userId },
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
    });
  }

  async findByProvider(provider: AuthProvider, providerId: string): Promise<AuthProviderModel | null> {
    return this.prisma.authProviderModel.findFirst({
      where: {
        provider,
        providerId,
      },
      include: {
        user: true,
      },
    });
  }

  async remove(id: number): Promise<AuthProviderModel> {
    const authProvider = await this.prisma.authProviderModel.findUnique({
      where: { id },
    });

    if (!authProvider) {
      throw new NotFoundException('Auth provider not found');
    }

    return this.prisma.authProviderModel.delete({
      where: { id },
    });
  }

  async removeByUserAndProvider(userId: number, provider: AuthProvider): Promise<void> {
    await this.prisma.authProviderModel.deleteMany({
      where: {
        userId,
        provider,
      },
    });
  }
}