"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context";
import { useUserInfoEditor, useAvatarUpload } from "./hooks";
import styles from "./userinfo-editor.module.css";

const UserInfoEditor = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const avatar = useAvatarUpload();

  const editor = useUserInfoEditor({
    user: user!,
    avatarFile: avatar.avatarFile,
    clearAvatarSelection: avatar.clearAvatarSelection,
    onSuccess: () => {
      avatar.clearAvatarSelection();
      setIsOpen(false);
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        avatar.clearAvatarSelection();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, avatar.clearAvatarSelection, avatar]);

  if (!user) return null;

  function openModal() {
    editor.resetForm();
    editor.setUsername(user.username);
    setIsOpen(true);
  }

  function closeModal() {
    if (editor.isSaving) return;

    avatar.clearAvatarSelection();
    editor.resetForm();
    setIsOpen(false);
  }

  return (
    <>
      <button type="button" className={styles.editButton} onClick={openModal}>
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
            aria-labelledby="user-info-editor-title"
          >
            <header className={styles.modalHeader}>
              <h2 id="user-info-editor-title">Редактировать профиль</h2>

              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
                disabled={editor.isSaving}
                aria-label="Закрыть окно"
              >
                ×
              </button>
            </header>

            <form className={styles.form} onSubmit={editor.handleSubmit}>
              <div>
                <label className={styles.label} htmlFor="avatar">
                  Аватар
                </label>

                {avatar.avatarPreview && (
                  <img
                    src={avatar.avatarPreview}
                    alt="Предпросмотр нового аватара"
                    width={100}
                    height={100}
                  />
                )}

                <input
                  id="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onClick={(event) => {
                    event.currentTarget.value = "";
                  }}
                  onChange={avatar.handleAvatarChange}
                />

                {avatar.avatarError && (
                  <p role="alert" className={styles.error}>
                    {avatar.avatarError}
                  </p>
                )}
              </div>

              <div>
                <label className={styles.label} htmlFor="username">
                  Имя пользователя
                </label>

                <input
                  id="username"
                  className={styles.input}
                  value={editor.username}
                  onChange={(event) => editor.setUsername(event.target.value)}
                  disabled={editor.isSaving}
                  autoComplete="username"
                />
              </div>

              {editor.message && (
                <p
                  className={editor.isError ? styles.error : styles.success}
                  role={editor.isError ? "alert" : "status"}
                >
                  {editor.message}
                </p>
              )}

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                  disabled={editor.isSaving}
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={editor.isSaving}
                >
                  {editor.isSaving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
};

export default UserInfoEditor;
