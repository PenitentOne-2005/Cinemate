import type {
  FriendRequest,
  Friend,
} from "../services/friendship/friendship.types";

export interface HomePageProps {
  initialFriends: Friend[];
  initialRequests: FriendRequest[];
}
