import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import type { GoogleUser } from './interface.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async loginWithGoogle(googleUser: GoogleUser) {
    let user = await this.findUserByGoogleSub(googleUser.googleSub);

    if (!user) {
      user = await this.createUser(googleUser);
    }

    const accessToken = await this.createAccessToken(user.id);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);

    const sessions = await this.prisma.refreshSession.findMany({
      where: {
        userId: payload.sub,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    let currentSession: (typeof sessions)[number] | null = null;

    for (const session of sessions) {
      if (await argon2.verify(session.tokenHash, refreshToken)) {
        currentSession = session;
        break;
      }
    }

    if (!currentSession) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (currentSession.revokedAt) {
      throw new UnauthorizedException('Refresh session revoked');
    }

    if (currentSession.usedAt) {
      await this.prisma.refreshSession.updateMany({
        where: {
          familyId: currentSession.familyId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const newToken = await this.generateRefreshToken(
      user.id,
      currentSession.familyId,
    );

    const accessToken = await this.createAccessToken(user.id);

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.refreshSession.updateMany({
        where: {
          id: currentSession.id,
          usedAt: null,
          revokedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      if (updated.count !== 1) {
        return false;
      }

      await tx.refreshSession.create({
        data: {
          userId: user.id,
          tokenId: newToken.tokenId,
          familyId: newToken.familyId,
          tokenHash: newToken.tokenHash,
          expiresAt: newToken.expiresAt,
        },
      });

      return true;
    });

    if (!result) {
      await this.prisma.refreshSession.updateMany({
        where: {
          familyId: currentSession.familyId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      throw new UnauthorizedException('Refresh token already used');
    }

    return {
      accessToken,
      refreshToken: newToken.refreshToken,
    };
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) {
      return;
    }

    let payload: { sub: string };

    try {
      payload = await this.verifyRefreshToken(refreshToken);
    } catch {
      return;
    }

    const sessions = await this.prisma.refreshSession.findMany({
      where: {
        userId: payload.sub,
      },
    });

    for (const session of sessions) {
      if (await argon2.verify(session.tokenHash, refreshToken)) {
        await this.prisma.refreshSession.delete({
          where: {
            id: session.id,
          },
        });

        return;
      }
    }
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
    const result = await this.cloudinaryService.uploadImage(
      file.buffer,
      'cinemeow/avatars',
    );

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: result.secure_url },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        username: true,
        createdAt: true,
      },
    });
  }

  private async findUserByGoogleSub(googleSub: string) {
    return this.prisma.user.findUnique({
      where: { googleSub },
    });
  }

  private async createUser(googleUser: GoogleUser) {
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

  private async createAccessToken(userId: string) {
    return this.jwtService.signAsync(
      {
        sub: userId,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );
  }

  private async createRefreshToken(userId: string) {
    const token = await this.generateRefreshToken(userId);

    await this.prisma.refreshSession.create({
      data: {
        userId,
        tokenId: token.tokenId,
        familyId: token.familyId,
        tokenHash: token.tokenHash,
        expiresAt: token.expiresAt,
      },
    });

    return token.refreshToken;
  }

  private async generateRefreshToken(
    userId: string,
    familyId: string = randomUUID(),
  ) {
    const tokenId = randomUUID();

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
        jti: tokenId,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );

    const tokenHash = await argon2.hash(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return {
      refreshToken,
      tokenHash,
      expiresAt,
      tokenId,
      familyId,
    };
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      return await this.jwtService.verifyAsync<{ sub: string }>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
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
