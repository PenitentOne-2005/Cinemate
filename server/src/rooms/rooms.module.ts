import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service.js';
import { RoomsController } from './rooms.controller.js';
import { RedisModule } from '../redis/redis.module.js';
import { RoomsGateway } from './rooms.gateway.js';
import { AuthModule } from '../auth/auth.module.js';
import { PresenceCleanupService } from './presence-cleanup.service.js';

@Module({
  imports: [RedisModule, AuthModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway, PresenceCleanupService],
  exports: [RoomsService],
})
export class RoomsModule {}
