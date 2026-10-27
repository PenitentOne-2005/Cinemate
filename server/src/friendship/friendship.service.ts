import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FriendshipService {
  constructor(private readonly prisma: PrismaService) {}

  async sendRequest(requesterId: string, addresseeId: string) {
    if (requesterId === addresseeId) {
      throw new BadRequestException('Нельзя отправить заявку самому себе');
    }

    const addressee = await this.prisma.user.findUnique({
      where: { id: addresseeId },
      select: { id: true },
    });

    if (!addressee) {
      throw new NotFoundException('Пользователь не найден');
    }

    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    if (existingFriendship) {
      throw new ConflictException(
        existingFriendship.status === 'accepted'
          ? 'Вы уже друзья'
          : 'Заявка между этими пользователями уже существует',
      );
    }

    return this.prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
      },
      select: {
        id: true,
        requesterId: true,
        addresseeId: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async acceptRequest(userId: string, requesterId: string) {
    const request = await this.prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId,
          addresseeId: userId,
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Входящая заявка не найдена');
    }

    if (request.status !== 'pending') {
      throw new ConflictException('Эта заявка уже обработана');
    }

    const result = await this.prisma.friendship.updateMany({
      where: {
        id: request.id,
        status: 'pending',
      },
      data: {
        status: 'accepted',
      },
    });

    if (result.count !== 1) {
      throw new ConflictException('Заявка уже была обработана');
    }

    return {
      message: 'Заявка принята',
    };
  }

  async rejectRequest(userId: string, requesterId: string) {
    const result = await this.prisma.friendship.deleteMany({
      where: {
        requesterId,
        addresseeId: userId,
        status: 'pending',
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Входящая заявка не найдена');
    }

    return {
      message: 'Заявка отклонена',
    };
  }

  async removeFriend(userId: string, friendId: string) {
    const result = await this.prisma.friendship.deleteMany({
      where: {
        status: 'accepted',
        OR: [
          {
            requesterId: userId,
            addresseeId: friendId,
          },
          {
            requesterId: friendId,
            addresseeId: userId,
          },
        ],
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Дружба не найдена');
    }

    return {
      message: 'Пользователь удалён из друзей',
    };
  }

  async searchUsers(currentUserId: string, username: string) {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      throw new BadRequestException('Введи username для поиска');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: { not: currentUserId },
        username: {
          equals: normalizedUsername,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
      },
    });

    return user ? [user] : [];
  }

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: {
        id: true,
        requesterId: true,
        requester: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        addressee: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return friendships.map((friendship) => ({
      friendshipId: friendship.id,
      createdAt: friendship.createdAt,
      friend:
        friendship.requesterId === userId
          ? friendship.addressee
          : friendship.requester,
    }));
  }

  async getReceivedRequests(userId: string) {
    const requests = await this.prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: 'pending',
      },
      select: {
        id: true,
        createdAt: true,
        requester: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests.map((request) => ({
      requestId: request.id,
      createdAt: request.createdAt,
      user: request.requester,
    }));
  }
}
