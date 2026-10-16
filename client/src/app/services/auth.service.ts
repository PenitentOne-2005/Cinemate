import apiRequest from "./api-client";
import type { AuthUser } from "../types/auth.types";

class AuthService {
  async getCurrentUser(): Promise<AuthUser> {
    return apiRequest<AuthUser>("/auth/me");
  }
}

export const authService = new AuthService();
