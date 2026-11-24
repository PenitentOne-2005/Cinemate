type RoomPrivacy = "everyone" | "friends";
type RoomSource = "youtube" | "drive";

export interface Room {
  id: string;
  ownerId: string;
  name: string;
  privacy: RoomPrivacy;
  source: RoomSource;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoomOwner {
  id: string;
  username: string | null;
  avatar: string | null;
}

export interface RoomInvite {
  id: string;
  roomId: string;
  userId: string;
  createdAt: string;
}

export interface RoomWithOwner extends Room {
  owner: RoomOwner;
}

export interface RoomWithInvites extends Room {
  invites: RoomInvite[];
}

export interface CreateRoomData {
  name: string;
  privacy: RoomPrivacy;
  source: RoomSource;
  sourceUrl?: string;
  invitedUserIds?: string[];
}

export interface DeleteRoomResponse {
  message: string;
}
