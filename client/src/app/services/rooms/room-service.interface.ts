import type {
  CreateRoomData,
  DeleteRoomResponse,
  Room,
  RoomWithInvites,
  RoomWithOwner,
} from "./rooms.service.types";

export interface IRoomService {
  getMyRooms(): Promise<Room[]>;

  getInvitedRooms(): Promise<RoomWithOwner[]>;

  getPublicRooms(): Promise<RoomWithOwner[]>;

  getRoomById(roomId: string): Promise<RoomWithOwner>;

  createRoom(data: CreateRoomData): Promise<RoomWithInvites>;

  deleteRoom(roomId: string): Promise<DeleteRoomResponse>;
}
