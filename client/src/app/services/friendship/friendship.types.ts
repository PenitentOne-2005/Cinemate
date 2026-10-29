export type FriendshipStatus = "pending" | "accepted";

export interface FriendshipUser {
  id: string;
  username: string | null;
  name: string;
  avatar: string | null;
}

export interface Friend {
  friendshipId: string;
  createdAt: string;
  friend: FriendshipUser;
}

export interface FriendRequest {
  requestId: string;
  createdAt: string;
  user: FriendshipUser;
}

export interface FriendshipResponse {
  message: string;
}
