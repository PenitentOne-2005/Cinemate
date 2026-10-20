import type { AuthUser } from "@/app/types/auth.types";
import { apiRequest } from "../client";

class AuthService {
  async getCurrentUser(): Promise<AuthUser> {
    return apiRequest<AuthUser>("/auth/me");
  }
}

export const authService = new AuthService();
