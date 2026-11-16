import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly config: ConfigService) {
    this.redis = new Redis(this.config.getOrThrow<string>('REDIS_URL'));

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error', error.stack);
    });
  }

  async onModuleInit() {
    await this.redis.ping();
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  get(key: string) {
    return this.redis.get(key);
  }

  set(key: string, value: string, ttl?: number) {
    if (ttl) {
      return this.redis.set(key, value, 'EX', ttl);
    }

    return this.redis.set(key, value);
  }

  del(key: string) {
    return this.redis.del(key);
  }

  sadd(key: string, value: string) {
    return this.redis.sadd(key, value);
  }

  srem(key: string, value: string) {
    return this.redis.srem(key, value);
  }

  smembers(key: string) {
    return this.redis.smembers(key);
  }

  zadd(key: string, score: number, value: string) {
    return this.redis.zadd(key, score, value);
  }

  expire(key: string, seconds: number) {
    return this.redis.expire(key, seconds);
  }

  eval(script: string, keys: string[], args: string[]) {
    return this.redis.eval(script, keys.length, ...keys, ...args);
  }
}
