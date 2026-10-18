"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ProtectedRouteProps } from "./interface";
import { useAuth } from "@/app/context";
import AuthStatus from "./auth-status";

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, error, refreshUser } = useAuth();

  useEffect(() => {
    if (!isLoading && !error && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, error, router]);

  if (isLoading || error) {
    return (
      <AuthStatus isLoading={isLoading} error={error} onRetry={refreshUser} />
    );
  }

  if (!user) {
    return null;
  }

  return children(user);
};

export default ProtectedRoute;
