import type { AuthUser } from "@/app/types/auth.types";

export interface UseUserInfoEditorOptions {
  user: AuthUser;
  avatarFile: File | null;
  clearAvatarSelection: () => void;
  onSuccess: () => void;
}
