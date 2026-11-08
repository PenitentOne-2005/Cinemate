import type { Friend } from "@/app/services/friendship/friendship.types";

export interface FriendsListProps {
  friends: Friend[];
  isLoading: boolean;
  busyUserId: string | null;
  onRemove: (userId: string) => void;
  onRefresh: () => void;
}
