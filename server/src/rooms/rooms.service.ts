import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicRooms() {
    return this.prisma.room.findMany({
      where: {
        privacy: 'everyone',
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createRoom(ownerId: string, dto: CreateRoomDto) {
    const invitedUserIds = dto.invitedUserIds ?? [];

    return this.prisma.$transaction(async (tx) => {
      if (invitedUserIds.length > 0) {
        const friendships = await tx.friendship.findMany({
          where: {
            status: 'accepted',
            OR: [
              {
                requesterId: ownerId,
                addresseeId: { in: invitedUserIds },
              },
              {
                addresseeId: ownerId,
                requesterId: { in: invitedUserIds },
              },
            ],
          },
          select: {
            requesterId: true,
            addresseeId: true,
          },
        });

        const friendIds = new Set(
          friendships.map((friendship) =>
            friendship.requesterId === ownerId
              ? friendship.addresseeId
              : friendship.requesterId,
          ),
        );

        if (friendIds.size !== invitedUserIds.length) {
          throw new BadRequestException('Приглашать можно только друзей.');
        }
      }

      return tx.room.create({
        data: {
          ownerId,
          name: dto.name,
          privacy: dto.privacy,
          source: dto.source,
          sourceUrl: dto.source === 'youtube' ? dto.sourceUrl : null,

          invites: {
            create: invitedUserIds.map((userId) => ({
              userId,
            })),
          },
        },
        include: {
          invites: true,
        },
      });
    });
  }

  async getMyRooms(userId: string) {
    return this.prisma.room.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getInvitedRooms(userId: string) {
    return this.prisma.room.findMany({
      where: {
        invites: {
          some: {
            userId,
          },
        },
        OR: [
          {
            privacy: 'everyone',
          },
          {
            privacy: 'friends',
            owner: {
              OR: [
                {
                  sentFriendRequests: {
                    some: {
                      addresseeId: userId,
                      status: 'accepted',
                    },
                  },
                },
                {
                  receivedFriendRequests: {
                    some: {
                      requesterId: userId,
                      status: 'accepted',
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getRoomById(roomId: string, userId: string) {
    await this.checkRoomAccess(roomId, userId);

    return this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getRoomOwnerId(roomId: string): Promise<string> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { ownerId: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room.ownerId;
  }

  async deleteRoom(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { ownerId: true },
    });

    if (!room) {
      throw new NotFoundException('Комната не найдена.');
    }

    if (room.ownerId !== userId) {
      throw new ForbiddenException('Вы не являетесь владельцем этой комнаты.');
    }

    await this.prisma.room.delete({
      where: { id: roomId },
    });

    return { message: 'Комната успешно удалена.' };
  }

  async checkRoomAccess(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        ownerId: true,
        privacy: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Комната не найдена.');
    }

    if (room.ownerId === userId || room.privacy === 'everyone') {
      return true;
    }

    const friendship = await this.prisma.friendship.findFirst({
      where: {
        status: 'accepted',
        OR: [
          {
            requesterId: room.ownerId,
            addresseeId: userId,
          },
          {
            requesterId: userId,
            addresseeId: room.ownerId,
          },
        ],
      },
      select: { id: true },
    });

    if (!friendship) {
      throw new ForbiddenException('У вас нет доступа к этой комнате.');
    }

    return true;
  }
}
