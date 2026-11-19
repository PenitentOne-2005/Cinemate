import type {
  FriendRequest,
  Friend,
} from "../services/friendship/friendship.types";
import type {
  Room,
  RoomWithOwner,
} from "../services/rooms/rooms.service.types";

export interface HomePageProps {
  initialFriends: Friend[];
  initialRequests: FriendRequest[];
  initialMyRooms: Room[];
  initialInvitedRooms: RoomWithOwner[];
  initialPublicRooms: RoomWithOwner[];
}
