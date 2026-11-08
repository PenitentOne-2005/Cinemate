import type { FriendRequest } from "@/app/services/friendship/friendship.types";

export interface ReceivedRequestsProps {
  requests: FriendRequest[];
  isLoading: boolean;
  busyUserId: string | null;
  onAccept: (userId: string) => void;
  onReject: (userId: string) => void;
}
