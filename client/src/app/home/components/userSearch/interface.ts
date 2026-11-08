import type { FriendshipUser } from "@/app/services/friendship/friendship.types";
import type { FormEvent } from "react";

export interface UserSearchProps {
  username: string;
  searchResults: FriendshipUser[];
  hasSearched: boolean;
  isSearching: boolean;
  busyUserId: string | null;
  onUsernameChange: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onSendRequest: (userId: string) => void;
}
