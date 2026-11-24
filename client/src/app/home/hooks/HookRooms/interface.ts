import type {
  Room,
  RoomWithOwner,
} from "@/app/services/rooms/rooms.service.types";

export interface UseRoomsProps {
  initialMyRooms: Room[];
  initialInvitedRooms: RoomWithOwner[];
  initialPublicRooms: RoomWithOwner[];
}
