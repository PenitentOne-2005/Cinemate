"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/app/context/auth-context";
import { authService } from "@/app/services/auth.service";
import { ApiError } from "@/app/types/auth.types";
import styles from "./username-editor.module.css";

const UsernameEditor = () => {
  const { user, updateUser } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving]);

  if (!user) return null;

  const currentUsername = user.username;

  function openModal() {
    setUsername(currentUsername);
    setMessage("");
    setIsError(false);
    setIsOpen(true);
  }

  function closeModal() {
    if (isSaving) return;
    setIsOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedUsername = username.trim().toLowerCase();

    if (
      !normalizedUsername ||
      normalizedUsername === currentUsername ||
      isSaving
    ) {
      return;
    }

    setIsSaving(true);
    setMessage("");
    setIsError(false);

    try {
      const updatedUser = await authService.updateUsername(normalizedUsername);

      updateUser(updatedUser);
      setUsername(updatedUser.username);
      setMessage("Username успешно изменён");
      setIsOpen(false);
    } catch (error) {
      setIsError(true);

      if (error instanceof ApiError && error.status === 409) {
        setMessage("Этот username уже занят");
      } else if (error instanceof ApiError && error.status === 400) {
        setMessage(error.message || "Проверьте формат username");
      } else {
        setMessage(
          error instanceof Error
            ? error.message
            : "Не удалось изменить username",
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  const hasChanged = username.trim().toLowerCase() !== currentUsername;

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
                <p>Измени имя, которое видят другие пользователи.</p>
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
