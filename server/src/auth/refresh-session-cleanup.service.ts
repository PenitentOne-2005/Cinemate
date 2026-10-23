import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RefreshSessionCleanupService {
  private readonly logger = new Logger(RefreshSessionCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 0 3 * * *')
  async cleanupExpiredSessions() {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - 30);

    const result = await this.prisma.refreshSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: retentionDate } },
          {
            revokedAt: {
              not: null,
              lt: retentionDate,
            },
          },
        ],
      },
    });

    this.logger.log(`Удалено устаревших сессий: ${result.count}`);
  }
}
