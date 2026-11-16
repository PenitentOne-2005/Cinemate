import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisService } from '../redis/redis.service.js';
import { RoomsGateway } from './rooms.gateway.js';

@Injectable()
export class PresenceCleanupService {
  private readonly logger = new Logger(PresenceCleanupService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly roomsGateway: RoomsGateway,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async cleanupDisconnectedUsers() {
    const script = `
      local connectionsKey = KEYS[1]
      local now = tonumber(ARGV[1])
      local limit = tonumber(ARGV[2])

      local expired = redis.call(
        'ZRANGEBYSCORE',
        connectionsKey,
        '-inf',
        now,
        'LIMIT',
        0,
        limit
      )

      local changedRooms = {}

      for _, entry in ipairs(expired) do
        local data = cjson.decode(entry)

        local socketsKey =
          'room:' .. data.roomId ..
          ':user:' .. data.userId .. ':sockets'

        local usersKey =
          'room:' .. data.roomId .. ':users'

        redis.call('SREM', socketsKey, data.socketId)

        local remainingSockets = redis.call('SCARD', socketsKey)

        if remainingSockets == 0 then
          redis.call('SREM', usersKey, data.userId)
          redis.call('DEL', socketsKey)

          table.insert(changedRooms, data.roomId)
        end

      end

      return changedRooms
    `;

    try {
      const changedRooms = (await this.redisService.eval(
        script,
        ['presence:connections'],
        [Date.now().toString(), '100'],
      )) as string[];

      for (const roomId of new Set(changedRooms)) {
        await this.roomsGateway.broadcastRoomUsers(roomId);
      }
    } catch (error) {
      this.logger.error(
        'Failed to clean up disconnected users',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
