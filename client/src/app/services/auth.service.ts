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
}

export const authService = new AuthService();
