"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService } from "../services/auth.service";
import { UnauthorizedError, type AuthUser } from "../types/auth.types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const currentUser = await authService.getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
          setError(null);
        }
      } catch (error) {
        if (cancelled) return;

        setUser(null);

        if (error instanceof UnauthorizedError) {
          setError(null);
        } else {
          setError(
            error instanceof Error
              ? error.message
              : "Не удалось проверить авторизацию",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);

      if (!(error instanceof UnauthorizedError)) {
        setError(
          error instanceof Error
            ? error.message
            : "Не удалось проверить авторизацию",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        error,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }

  return context;
}
