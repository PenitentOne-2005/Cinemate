import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import * as cookie from 'cookie';
import { UnauthorizedException } from '@nestjs/common';
import { RoomsService } from './rooms.service.js';
import { RedisService } from '../redis/redis.service.js';
import type { PlaybackState } from './interface.js';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class RoomsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly roomsService: RoomsService,
    private readonly redisService: RedisService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const cookieHeader = client.handshake.headers.cookie;

      if (!cookieHeader) {
        throw new UnauthorizedException();
      }

      const cookies = cookie.parseCookie(cookieHeader);
      const accessToken = cookies.access_token;

      if (!accessToken) {
        throw new UnauthorizedException();
      }

      const payload = await this.jwtService.verifyAsync<{
        sub: string;
      }>(accessToken, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      if (!payload.sub) {
        throw new UnauthorizedException();
      }

      client.data.userId = payload.sub;
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId;

    if (!userId) {
      throw new WsException('Unauthorized');
    }

    if (client.data.roomId) {
      throw new WsException('Already joined a room');
    }

    if (!data?.roomId) {
      throw new WsException('Room ID is required');
    }

    await this.roomsService.checkRoomAccess(data.roomId, userId);

    const connection = JSON.stringify({
      roomId: data.roomId,
      userId,
      socketId: client.id,
    });

    const script = `
    local connectionsKey = KEYS[1]
    local socketsKey = KEYS[2]
    local usersKey = KEYS[3]

    local connection = ARGV[1]
    local socketId = ARGV[2]
    local userId = ARGV[3]
    local expiresAt = tonumber(ARGV[4])

    redis.call('SADD', usersKey, userId)
    redis.call('SADD', socketsKey, socketId)
    redis.call('ZADD', connectionsKey, expiresAt, connection)

    return 1
    `;

    await this.redisService.eval(
      script,
      [
        'presence:connections',
        `room:${data.roomId}:user:${userId}:sockets`,
        `room:${data.roomId}:users`,
      ],
      [connection, client.id, userId, (Date.now() + 30_000).toString()],
    );

    await client.join(data.roomId);
    client.data.roomId = data.roomId;

    await this.broadcastRoomUsers(data.roomId);

    const playbackState = await this.getPlaybackState(data.roomId);

    if (playbackState) {
      const now = Date.now();

      const currentTime = playbackState.isPlaying
        ? playbackState.currentTime + (now - playbackState.updatedAt) / 1000
        : playbackState.currentTime;

      client.emit('playback-updated', {
        ...playbackState,
        currentTime,
        updatedAt: now,
      });
    }

    return {
      event: 'joined-room',
      data: {
        roomId: data.roomId,
        userId,
      },
    };
  }

  @SubscribeMessage('presence-heartbeat')
  async handlePresenceHeartbeat(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    const roomId = client.data.roomId;

    if (!userId || !roomId) return;

    const connection = JSON.stringify({
      roomId,
      userId,
      socketId: client.id,
    });

    const script = `
    local connectionsKey = KEYS[1]
    local socketsKey = KEYS[2]
    local usersKey = KEYS[3]

    local connection = ARGV[1]
    local socketId = ARGV[2]
    local userId = ARGV[3]
    local expiresAt = tonumber(ARGV[4])

    local wasMember = redis.call('SISMEMBER', usersKey, userId)

    redis.call('SADD', socketsKey, socketId)
    redis.call('SADD', usersKey, userId)
    redis.call('ZADD', connectionsKey, expiresAt, connection)

    return wasMember
    `;

    const wasMember = await this.redisService.eval(
      script,
      [
        'presence:connections',
        `room:${roomId}:user:${userId}:sockets`,
        `room:${roomId}:users`,
      ],
      [connection, client.id, userId, (Date.now() + 30_000).toString()],
    );

    if (!wasMember) {
      await this.broadcastRoomUsers(roomId);
    }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    const roomId = client.data.roomId;

    if (!userId || !roomId) {
      return;
    }

    const connection = JSON.stringify({
      roomId,
      userId,
      socketId: client.id,
    });

    const script = `
    local socketsKey = KEYS[2]
    local usersKey = KEYS[3]
    local connectionsKey = KEYS[1]
    
    local socketId = ARGV[2]
    local userId = ARGV[3]
    local connection = ARGV[1]

    local wasMember = redis.call('SISMEMBER', socketsKey, socketId)

    if wasMember == 0 then
      return -1
    end

    redis.call('ZREM', connectionsKey, connection)
    redis.call('SREM', socketsKey, socketId)


    if redis.call('SCARD', socketsKey) == 0 then
      redis.call('SREM', usersKey, userId)
      redis.call('DEL', socketsKey)
    end

    return 1
    `;

    const result = await this.redisService.eval(
      script,
      [
        'presence:connections',
        `room:${roomId}:user:${userId}:sockets`,
        `room:${roomId}:users`,
      ],
      [connection, client.id, userId],
    );

    if (Number(result) === -1) {
      return;
    }

    await client.leave(roomId);

    await this.broadcastRoomUsers(roomId);

    delete client.data.roomId;
  }

  @SubscribeMessage('playback-play')
  async handlePlaybackPlay(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    const roomId = client.data.roomId;

    if (!userId || !roomId) {
      throw new WsException('You are not in a room');
    }

    await this.roomsService.checkRoomAccess(roomId, userId);
    await this.checkRoomOwner(roomId, userId);

    const newState = await this.updatePlaybackState(roomId, 'play');

    this.server.to(roomId).emit('playback-updated', newState);
  }

  @SubscribeMessage('playback-pause')
  async handlePlaybackPause(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    const roomId = client.data.roomId;

    if (!userId || !roomId) {
      throw new WsException('You are not in a room');
    }

    await this.roomsService.checkRoomAccess(roomId, userId);
    await this.checkRoomOwner(roomId, userId);

    const newState = await this.updatePlaybackState(roomId, 'pause');

    this.server.to(roomId).emit('playback-updated', newState);
  }

  @SubscribeMessage('playback-seek')
  async handlePlaybackSeek(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { currentTime: number },
  ) {
    const userId = client.data.userId;
    const roomId = client.data.roomId;

    if (!userId || !roomId) {
      throw new WsException('You are not in a room');
    }

    if (
      typeof data?.currentTime !== 'number' ||
      !Number.isFinite(data.currentTime) ||
      data.currentTime < 0
    ) {
      throw new WsException('Invalid playback position');
    }

    await this.roomsService.checkRoomAccess(roomId, userId);
    await this.checkRoomOwner(roomId, userId);

    const newState = await this.updatePlaybackState(
      roomId,
      'seek',
      data.currentTime,
    );

    this.server.to(roomId).emit('playback-updated', newState);
  }

  async broadcastRoomUsers(roomId: string) {
    const users = await this.getRoomUsers(roomId);

    this.server.to(roomId).emit('room-users-updated', {
      roomId,
      users,
    });
  }

  private async getRoomUsers(roomId: string) {
    return this.redisService.smembers(`room:${roomId}:users`);
  }

  private async getPlaybackState(
    roomId: string,
  ): Promise<PlaybackState | null> {
    const state = await this.redisService.get(`room:${roomId}:playback`);

    return state ? (JSON.parse(state) as PlaybackState) : null;
  }

  private async checkRoomOwner(roomId: string, userId: string): Promise<void> {
    const ownerId = await this.roomsService.getRoomOwnerId(roomId);

    if (ownerId !== userId) {
      throw new WsException('Only room owner can control playback');
    }
  }

  private async updatePlaybackState(
    roomId: string,
    action: 'play' | 'pause' | 'seek',
    seekTime?: number,
  ): Promise<PlaybackState> {
    const script = `
    local key = KEYS[1]
    local action = ARGV[1]
    local now = tonumber(ARGV[2])
    local seekTime = tonumber(ARGV[3])

    local raw = redis.call('GET', key)

    local state = raw and cjson.decode(raw) or {
      isPlaying = false,
      currentTime = 0,
      updatedAt = now
    }

    local currentTime = tonumber(state.currentTime) or 0
    local isPlaying = state.isPlaying == true

    if isPlaying then
      currentTime = currentTime +
        (now - tonumber(state.updatedAt)) / 1000
    end

    if action == 'seek' then
      currentTime = seekTime
    elseif action == 'play' then
      isPlaying = true
    elseif action == 'pause' then
      isPlaying = false
    end

    local newState = {
      isPlaying = isPlaying,
      currentTime = currentTime,
      updatedAt = now
    }

    redis.call('SET', key, cjson.encode(newState))

    return cjson.encode(newState)
  `;

    const result = await this.redisService.eval(
      script,
      [`room:${roomId}:playback`],
      [action, Date.now().toString(), (seekTime ?? 0).toString()],
    );

    return JSON.parse(String(result)) as PlaybackState;
  }
}
