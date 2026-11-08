import type { FriendshipUser } from "@/app/services/friendship/friendship.types";

export interface UserCardProps {
  user: FriendshipUser;
  children?: React.ReactNode;
}
