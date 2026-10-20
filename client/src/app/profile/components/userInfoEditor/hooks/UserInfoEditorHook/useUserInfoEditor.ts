"use client";

import { useState } from "react";
import type { UseUserInfoEditorOptions } from "./interface";
import { ApiError } from "@/app/types/auth.types";
import { useAuth } from "@/app/context";
import { userService } from "@/app/services";

const useUserInfoEditor = ({
  user,
  avatarFile,
  clearAvatarSelection,
  onSuccess,
}: UseUserInfoEditorOptions) => {
  const { updateUser } = useAuth();

  const [username, setUsername] = useState(user.username);
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

    let latestUser = user;
    let hasError = false;
    let usernameUpdated = false;
    let avatarUpdated = false;

    try {
      if (normalizedUsername !== user.username) {
        try {
          latestUser = await userService.updateUsername(normalizedUsername);

          updateUser(latestUser);
          usernameUpdated = true;
        } catch (error) {
          hasError = true;
          showError(error);
        }
      }

      if (avatarFile) {
        try {
          latestUser = await userService.updateAvatar(avatarFile);

          updateUser(latestUser);
          avatarUpdated = true;
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

      if (hasError) {
        // Не закрываем окно: пользователь может исправить ошибку.
        // Уже успешно сохранённые изменения остаются сохранёнными.
        return;
      }

      updateUser(latestUser);
      setMessage("Изменения сохранены.");

      if (usernameUpdated || avatarUpdated) {
        onSuccess();
      } else {
        onSuccess();
      }
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
