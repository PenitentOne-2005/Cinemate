import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard.js';
import { CurrentUser } from '../current-user.decorator.js';
import { FriendshipService } from './friendship.service.js';

@Controller('friendships')
@UseGuards(JwtAuthGuard)
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post(':userId')
  sendRequest(
    @CurrentUser() user: { userId: string },
    @Param('userId', ParseUUIDPipe) addresseeId: string,
  ) {
    return this.friendshipService.sendRequest(user.userId, addresseeId);
  }

  @Patch(':userId/accept')
  acceptRequest(
    @CurrentUser() user: { userId: string },
    @Param('userId', ParseUUIDPipe) requesterId: string,
  ) {
    return this.friendshipService.acceptRequest(user.userId, requesterId);
  }

  @Patch(':userId/reject')
  rejectRequest(
    @CurrentUser() user: { userId: string },
    @Param('userId', ParseUUIDPipe) requesterId: string,
  ) {
    return this.friendshipService.rejectRequest(user.userId, requesterId);
  }

  @Delete(':userId')
  removeFriend(
    @CurrentUser() user: { userId: string },
    @Param('userId', ParseUUIDPipe) friendId: string,
  ) {
    return this.friendshipService.removeFriend(user.userId, friendId);
  }

  @Get('search')
  searchUsers(
    @CurrentUser() user: { userId: string },
    @Query('username') username: string,
  ) {
    if (username === undefined) {
      throw new BadRequestException('Укажи username для поиска');
    }

    return this.friendshipService.searchUsers(user.userId, username);
  }

  @Get()
  getFriends(@CurrentUser() user: { userId: string }) {
    return this.friendshipService.getFriends(user.userId);
  }

  @Get('requests/received')
  getReceivedRequests(@CurrentUser() user: { userId: string }) {
    return this.friendshipService.getReceivedRequests(user.userId);
  }
}
