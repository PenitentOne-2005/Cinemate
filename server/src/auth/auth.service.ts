import { Injectable } from '@nestjs/common';
import type { GoogleUser } from './interface.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async loginWithGoogle(googleUser: GoogleUser) {
    let user = await this.findUserByGoogleSub(googleUser.googleSub);

    if (!user) {
      user = await this.createUser(googleUser);
    }

    return user;
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
}