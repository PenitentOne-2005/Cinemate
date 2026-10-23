import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { JwtStrategy } from './jwt.strategy.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RefreshSessionCleanupService } from './refresh-session-cleanup.service.js';

@Module({
  imports: [PassportModule, JwtModule.register({}), CloudinaryModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    PrismaService,
    JwtStrategy,
    RefreshSessionCleanupService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
