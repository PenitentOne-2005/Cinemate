import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service.js';
import { JwtAuthGuard } from '../jwt-auth.guard.js';
import { CreateRoomDto } from './dto/create-room.dto.js';
import { CurrentUser } from '../current-user.decorator.js';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('public')
  getPublicRooms() {
    return this.roomsService.getPublicRooms();
  }

  @Post()
  createRoom(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateRoomDto,
  ) {
    return this.roomsService.createRoom(user.userId, dto);
  }

  @Get('my')
  getMyRooms(@CurrentUser() user: { userId: string }) {
    return this.roomsService.getMyRooms(user.userId);
  }

  @Get('invited')
  getInvitedRooms(@CurrentUser() user: { userId: string }) {
    return this.roomsService.getInvitedRooms(user.userId);
  }

  @Get(':id')
  getRoomById(
    @Param('id') roomId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.roomsService.getRoomById(roomId, user.userId);
  }

  @Delete(':id')
  deleteRoom(
    @Param('id') roomId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.roomsService.deleteRoom(roomId, user.userId);
  }
}
