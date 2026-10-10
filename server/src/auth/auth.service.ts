import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type { GoogleUser } from './interface.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
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
      refreshToken
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

    let currentSessionId: string | null = null;

    for (const session of sessions) {
      if (await argon2.verify(session.tokenHash, refreshToken)) {
        currentSessionId = session.id;
        break;
      }
    }

    if (!currentSessionId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const newToken = await this.generateRefreshToken(user.id);
    const accessToken = await this.createAccessToken(user.id);

    await this.prisma.$transaction(async (tx) => {
      const deleted = await tx.refreshSession.deleteMany({
        where: {
          id: currentSessionId!,
          userId: user.id,
        },
      });

      if (deleted.count !== 1) {
        throw new UnauthorizedException('Refresh token already used');
      }

      await tx.refreshSession.create({
        data: {
          userId: user.id,
          tokenHash: newToken.tokenHash,
          expiresAt: newToken.expiresAt,
        },
      });
    });

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

  private async findUserByGoogleSub(googleSub: string) {
    return this.prisma.user.findUnique({
      where: { googleSub },
    });
  }

  private async createUser(googleUser: GoogleUser) {
    return this.prisma.user.create({
      data: {
        googleSub: googleUser.googleSub,
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.avatar,
      },
    });
  }

  private async createAccessToken(userId: string) {
    return this.jwtService.signAsync(
      {
        sub: userId,
      },
      {
        secret: this.configService.getOrThrow<string>(
          'JWT_ACCESS_SECRET',
        ),
        expiresIn: '15m',
      },
    );
  }

  private async createRefreshToken(userId: string) {
    const token = await this.generateRefreshToken(userId);

    await this.prisma.refreshSession.create({
      data: {
        userId,
        tokenHash: token.tokenHash,
        expiresAt: token.expiresAt,
      },
    });

    return token.refreshToken;
  }

  private async generateRefreshToken(userId: string) {
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.configService.getOrThrow<string>(
          'JWT_REFRESH_SECRET',
        ),
        expiresIn: '7d',
      },
    );

    const tokenHash = await argon2.hash(refreshToken);
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    return {
      refreshToken,
      tokenHash,
      expiresAt,
    };
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      return await this.jwtService.verifyAsync<{ sub: string }>(
        refreshToken,
       {
          secret: this.configService.getOrThrow<string>(
            'JWT_REFRESH_SECRET',
          ),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}