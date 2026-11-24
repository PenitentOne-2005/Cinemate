import type { Friend } from "@/app/services/friendship/friendship.types";
import type { CreateRoomData } from "@/app/services/rooms/rooms.service.types";

export interface CreateRoomModalProps {
  friends: Friend[];
  isCreating: boolean;
  onClose: () => void;
  onCreate: (data: CreateRoomData) => Promise<boolean>;
}

export interface CreateRoomFormValues {
  name: string;
  privacy: "everyone" | "friends";
  source: "youtube" | "drive";
  sourceUrl: string;
  invitedUserIds: string[];
}
