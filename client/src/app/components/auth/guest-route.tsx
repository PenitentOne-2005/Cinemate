"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { GuestRouteProps } from "./interface";
import { useAuth } from "@/app/context";
import AuthStatus from "./auth-status";

const GuestRoute = ({ children }: GuestRouteProps) => {
  const router = useRouter();
  const { isLoading, isAuthenticated, error, refreshUser } = useAuth();

  useEffect(() => {
    if (!isLoading && !error && isAuthenticated) {
      router.replace("/profile");
    }
  }, [isLoading, isAuthenticated, error, router]);

  if (isLoading || error) {
    return (
      <AuthStatus isLoading={isLoading} error={error} onRetry={refreshUser} />
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
};

export default GuestRoute;
