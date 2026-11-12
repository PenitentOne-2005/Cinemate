import type { AuthUser } from "@/app/shared/types";
import { apiRequest } from "../client";
import { ENDPOINTS } from "@/app/shared/api";

class AuthService {
  async getCurrentUser(): Promise<AuthUser> {
    return apiRequest<AuthUser>(ENDPOINTS.auth.me);
  }
}

export const authService = new AuthService();
