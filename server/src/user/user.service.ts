import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { GoogleUser } from './interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async updateUsername(userId: string, username: string) {
    const normalizedUsername = username.toLowerCase();

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { username: normalizedUsername },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          username: true,
          createdAt: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Этот username уже занят');
      }

      throw error;
    }
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        avatarPublicId: true,
      },
    });

    const result = await this.cloudinaryService.uploadImage(
      file.buffer,
      'cinemeow/avatars',
    );

    let updatedUser;

    try {
      updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          avatar: result.secure_url,
          avatarPublicId: result.public_id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          username: true,
          createdAt: true,
        },
      });
    } catch (error) {
      try {
        await this.cloudinaryService.deleteImage(result.public_id);
      } catch (cleanupError) {
        this.logger.error(
          `Не удалось удалить новый аватар ${result.public_id} после ошибки обновления БД`,
          cleanupError instanceof Error
            ? cleanupError.stack
            : String(cleanupError),
        );
      }

      this.logger.error(
        `Не удалось обновить аватар пользователя ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Не удалось сохранить новый аватар',
      );
    }

    if (user.avatarPublicId && user.avatarPublicId !== result.public_id) {
      try {
        await this.cloudinaryService.deleteImage(user.avatarPublicId);
      } catch (error) {
        this.logger.error(
          `Не удалось удалить старый аватар ${user.avatarPublicId} пользователя ${userId}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    return updatedUser;
  }

  async createFromGoogle(googleUser: GoogleUser) {
    const username = await this.generateUsername(googleUser.name);

    return this.prisma.user.create({
      data: {
        googleSub: googleUser.googleSub,
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.avatar,
        username,
      },
    });
  }

  private async generateUsername(name: string): Promise<string> {
    const baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';

    let username = baseUsername;
    let suffix = 1;

    while (
      await this.prisma.user.findUnique({
        where: { username },
        select: { id: true },
      })
    ) {
      username = `${baseUsername}${suffix}`;
      suffix++;
    }

    return username;
  }
}
