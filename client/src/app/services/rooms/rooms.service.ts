import type { IRoomService } from "./room-service.interface";
import type {
  CreateRoomData,
  DeleteRoomResponse,
  Room,
  RoomWithInvites,
  RoomWithOwner,
} from "./rooms.service.types";
import { apiRequest } from "../client";
import { ENDPOINTS } from "@/app/shared/api";

class RoomService implements IRoomService {
  async getMyRooms() {
    return apiRequest<Room[]>(ENDPOINTS.rooms.my);
  }

  async getInvitedRooms() {
    return apiRequest<RoomWithOwner[]>(ENDPOINTS.rooms.invited);
  }

  async getPublicRooms() {
    return apiRequest<RoomWithOwner[]>(ENDPOINTS.rooms.public);
  }

  async getRoomById(roomId: string) {
    return apiRequest<RoomWithOwner>(ENDPOINTS.rooms.byId(roomId));
  }

  async createRoom(data: CreateRoomData) {
    return apiRequest<RoomWithInvites>(ENDPOINTS.rooms.base, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  async deleteRoom(roomId: string) {
    return apiRequest<DeleteRoomResponse>(ENDPOINTS.rooms.byId(roomId), {
      method: "DELETE",
    });
  }
}

export const roomService = new RoomService();
