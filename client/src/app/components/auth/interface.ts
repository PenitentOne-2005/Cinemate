import type { AuthUser } from "@/app/types/auth.types";
import type { ReactNode } from "react";

export interface ProtectedRouteProps {
  children: (user: AuthUser) => ReactNode;
}

export interface GuestRouteProps {
  children: ReactNode;
}

export interface AuthStatusProps {
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}
