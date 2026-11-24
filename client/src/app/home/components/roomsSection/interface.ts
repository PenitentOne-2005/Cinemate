import type {
  Room,
  RoomWithOwner,
} from "@/app/services/rooms/rooms.service.types";

export interface RoomsSectionProps {
  myRooms: Room[];
  invitedRooms: RoomWithOwner[];
  publicRooms: RoomWithOwner[];
  isLoading: boolean;
  busyRoomId: string | null;
  onDeleteRoom: (roomId: string) => void;
  onOpenCreateRoom: () => void;
}
