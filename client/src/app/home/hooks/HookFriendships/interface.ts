import type {
  Friend,
  FriendRequest,
} from "@/app/services/friendship/friendship.types";

export interface UseFriendshipsProps {
  initialFriends: Friend[];
  initialRequests: FriendRequest[];
}
