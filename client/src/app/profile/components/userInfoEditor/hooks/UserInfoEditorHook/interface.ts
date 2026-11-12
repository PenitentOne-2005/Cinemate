import type { AuthUser } from "@/app/shared/types";

export interface UseUserInfoEditorOptions {
  user: AuthUser;
  avatarFile: File | null;
  clearAvatarSelection: () => void;
  onSuccess: () => void;
}
