import type {
  Friend,
  FriendRequest,
  FriendshipResponse,
  FriendshipUser,
} from "./friendship.types";

export interface IFriendshipService {
  searchUsers(username: string): Promise<FriendshipUser[]>;

  getFriends(): Promise<Friend[]>;

  getReceivedRequests(): Promise<FriendRequest[]>;

  sendRequest(userId: string): Promise<FriendshipResponse>;

  acceptRequest(userId: string): Promise<FriendshipResponse>;

  rejectRequest(userId: string): Promise<FriendshipResponse>;

  removeFriend(userId: string): Promise<FriendshipResponse>;
}
