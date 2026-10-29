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
      `/friendships/search?username=${encodeURIComponent(username)}`,
    );
  }

  async getFriends() {
    return apiRequest<Friend[]>("/friendships");
  }

  async getReceivedRequests() {
    return apiRequest<FriendRequest[]>("/friendships/requests/received");
  }

  async sendRequest(userId: string) {
    return apiRequest<FriendshipResponse>(`/friendships/${userId}`, {
      method: "POST",
    });
  }

  async acceptRequest(userId: string) {
    return apiRequest<FriendshipResponse>(`/friendships/${userId}/accept`, {
      method: "PATCH",
    });
  }

  async rejectRequest(userId: string) {
    return apiRequest<FriendshipResponse>(`/friendships/${userId}/reject`, {
      method: "PATCH",
    });
  }

  async removeFriend(userId: string) {
    return apiRequest<FriendshipResponse>(`/friendships/${userId}`, {
      method: "DELETE",
    });
  }
}

export const friendshipService = new FriendshipService();
