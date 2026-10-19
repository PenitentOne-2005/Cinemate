import apiRequest from "./api-client";
import type { AuthUser } from "../types/auth.types";

class AuthService {
  async getCurrentUser(): Promise<AuthUser> {
    return apiRequest<AuthUser>("/auth/me");
  }

  async updateUsername(username: string): Promise<AuthUser> {
    return apiRequest<AuthUser>("/auth/me/username", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
  }

  async updateAvatar(file: File): Promise<AuthUser> {
    const formData = new FormData();
    formData.append("avatar", file);

    return apiRequest<AuthUser>("/auth/me/avatar", {
      method: "PATCH",
      body: formData,
    });
  }
}

export const authService = new AuthService();
