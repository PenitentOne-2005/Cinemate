import { ENDPOINTS } from "@/app/shared/api";
import { apiRequest } from "../client";
import type { IFriendshipService } from "./friendship.service.interface";
import type {
  Friend,
  FriendRequest,
  FriendshipResponse,
  FriendshipUser,
} from "./friendship.types";

class FriendshipService implements IFriendshipService {
  async searchUsers(username: string) {
    return apiRequest<FriendshipUser[]>(
      `${ENDPOINTS.friendships.search}?username=${encodeURIComponent(username)}`,
    );
  }

  async getFriends() {
    return apiRequest<Friend[]>(ENDPOINTS.friendships.base);
  }

  async getReceivedRequests() {
    return apiRequest<FriendRequest[]>(ENDPOINTS.friendships.receivedRequests);
  }

  async sendRequest(userId: string) {
    return apiRequest<FriendshipResponse>(
      ENDPOINTS.friendships.byUser(userId),
      {
        method: "POST",
      },
    );
  }

  async acceptRequest(userId: string) {
    return apiRequest<FriendshipResponse>(
      ENDPOINTS.friendships.accept(userId),
      {
        method: "PATCH",
      },
    );
  }

  async rejectRequest(userId: string) {
    return apiRequest<FriendshipResponse>(
      ENDPOINTS.friendships.reject(userId),
      {
        method: "PATCH",
      },
    );
  }

  async removeFriend(userId: string) {
    return apiRequest<FriendshipResponse>(
      ENDPOINTS.friendships.byUser(userId),
      {
        method: "DELETE",
      },
    );
  }
}

export const friendshipService = new FriendshipService();
