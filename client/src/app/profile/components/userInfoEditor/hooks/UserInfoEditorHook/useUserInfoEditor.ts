"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UseUserInfoEditorOptions } from "./interface";
import { ApiError } from "@/app/shared/types";
import { userService } from "@/app/services";

const useUserInfoEditor = ({
  user,
  avatarFile,
  clearAvatarSelection,
  onSuccess,
}: UseUserInfoEditorOptions) => {
  const router = useRouter();

  const [username, setUsername] = useState(() => user.username);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function resetForm() {
    setUsername(user.username);
    setMessage("");
    setIsError(false);
    clearAvatarSelection();
  }

  function showError(error: unknown) {
    setIsError(true);

    if (error instanceof ApiError) {
      if (error.status === 409) {
        setMessage("Это имя пользователя уже занято.");
        return;
      }

      if (error.status === 400) {
        setMessage(error.message);
        return;
      }

      setMessage(error.message);
      return;
    }

    setMessage("Не удалось сохранить изменения.");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername) {
      setIsError(true);
      setMessage("Имя пользователя не может быть пустым.");
      return;
    }

    setIsSaving(true);
    setMessage("");
    setIsError(false);

    let hasError = false;
    let usernameUpdated = false;

    try {
      if (normalizedUsername !== user.username) {
        try {
          await userService.updateUsername(normalizedUsername);
          usernameUpdated = true;
        } catch (error) {
          hasError = true;
          showError(error);
        }
      }

      if (avatarFile) {
        try {
          await userService.updateAvatar(avatarFile);
        } catch (error) {
          hasError = true;
          if (!usernameUpdated) {
            showError(error);
          } else {
            setIsError(true);
            setMessage(
              "Имя пользователя обновлено, но аватар сохранить не удалось.",
            );
          }
        }
      }

      if (hasError) return;

      setMessage("Изменения сохранены.");

      router.refresh();

      onSuccess();
    } finally {
      setIsSaving(false);
    }
  }

  return {
    username,
    setUsername,
    isSaving,
    message,
    isError,
    setMessage,
    setIsError,
    resetForm,
    handleSubmit,
  };
};

export default useUserInfoEditor;
