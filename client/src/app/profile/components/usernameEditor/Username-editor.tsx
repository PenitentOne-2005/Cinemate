"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/app/context/auth-context";
import { authService } from "@/app/services/auth.service";
import { ApiError, type AuthUser } from "@/app/types/auth.types";
import styles from "./username-editor.module.css";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

const UsernameEditor = () => {
  const { user, updateUser } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSaving]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  if (!user) return null;

  const currentUsername = user.username;

  const hasChanged =
    username.trim().toLowerCase() !== currentUsername || avatarFile !== null;

  function clearAvatarSelection() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setAvatarFile(null);
    setAvatarPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function openModal() {
    setUsername(currentUsername);
    clearAvatarSelection();
    setMessage("");
    setIsError(false);
    setIsOpen(true);
  }

  function closeModal() {
    if (isSaving) return;

    clearAvatarSelection();
    setIsOpen(false);
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setMessage("Выбери изображение JPEG, PNG или WebP");
      setIsError(true);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setMessage("Размер изображения не должен превышать 5 МБ");
      setIsError(true);
      event.target.value = "";
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;

    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    setMessage("");
    setIsError(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving || !hasChanged) return;
    if (!user) return;

    const normalizedUsername = username.trim().toLowerCase();
    const usernameChanged = normalizedUsername !== currentUsername;
    const selectedAvatar = avatarFile;

    setIsSaving(true);
    setMessage("");
    setIsError(false);

    let latestUser: AuthUser = user;
    const errors: string[] = [];
    let updatedSomething = false;

    try {
      if (usernameChanged) {
        try {
          const updatedUser =
            await authService.updateUsername(normalizedUsername);

          latestUser = updatedUser;
          updateUser(updatedUser);
          updatedSomething = true;
        } catch (error) {
          errors.push(
            error instanceof ApiError && error.status === 409
              ? "Этот username уже занят"
              : error instanceof ApiError && error.status === 400
                ? error.message
                : "Не удалось изменить username",
          );
        }
      }

      if (selectedAvatar) {
        try {
          const updatedUser = await authService.updateAvatar(selectedAvatar);

          latestUser = updatedUser;
          updateUser(updatedUser);
          updatedSomething = true;
        } catch (error) {
          errors.push(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить аватар",
          );
        }
      }

      if (errors.length > 0) {
        setIsError(true);
        setMessage(
          updatedSomething
            ? `Профиль обновлён частично. ${errors.join(". ")}`
            : errors.join(". "),
        );

        return;
      }

      setUsername(latestUser.username);
      clearAvatarSelection();
      setMessage("Профиль успешно обновлён");
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <button
        className={styles.editButton}
        type="button"
        onClick={openModal}
        aria-label="Редактировать профиль"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
        Edit
      </button>

      {isOpen && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 id="edit-profile-title">Edit profile</h2>
                <p>
                  Измени аватар и username, которые видят другие пользователи.
                </p>
              </div>

              <button
                className={styles.closeButton}
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                aria-label="Закрыть окно"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.avatarEditor}>
                <img
                  className={styles.avatarPreview}
                  src={avatarPreview ?? user.avatar ?? "/default-avatar.png"}
                  alt="Предпросмотр аватара"
                />

                <input
                  ref={fileInputRef}
                  id="edit-avatar"
                  name="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  disabled={isSaving}
                  onChange={handleAvatarChange}
                />

                <button
                  className={styles.cancelButton}
                  type="button"
                  disabled={isSaving}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose avatar
                </button>

                {avatarFile && (
                  <button
                    className={styles.cancelButton}
                    type="button"
                    disabled={isSaving}
                    onClick={clearAvatarSelection}
                  >
                    Remove selection
                  </button>
                )}
              </div>

              <label className={styles.label} htmlFor="edit-username">
                Username
              </label>

              <div className={styles.inputWrapper}>
                <span aria-hidden="true">@</span>

                <input
                  className={styles.input}
                  id="edit-username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setMessage("");
                    setIsError(false);
                  }}
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                  autoComplete="username"
                  aria-invalid={isError}
                  aria-describedby={
                    message ? "username-message" : "username-hint"
                  }
                  disabled={isSaving}
                  autoFocus
                  required
                />
              </div>

              <p className={styles.hint} id="username-hint">
                От 3 до 20 символов: латинские буквы, цифры и _.
              </p>

              {message && (
                <p
                  className={`${styles.message} ${
                    isError ? styles.error : styles.success
                  }`}
                  id="username-message"
                  role={isError ? "alert" : "status"}
                >
                  {message}
                </p>
              )}

              <div className={styles.actions}>
                <button
                  className={styles.cancelButton}
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  className={styles.saveButton}
                  type="submit"
                  disabled={!hasChanged || isSaving}
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
};

export default UsernameEditor;
