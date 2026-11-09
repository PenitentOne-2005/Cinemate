"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { UserInfoEditorProps } from "./interface";
import { useUserInfoEditor, useAvatarUpload } from "./hooks";
import { Input, Button } from "@/app/components";
import styles from "./userinfo-editor.module.css";

const UserInfoEditor = ({ user }: UserInfoEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const avatar = useAvatarUpload();

  const editor = useUserInfoEditor({
    user: user,
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
      <Button type="button" className="editButton" onClick={openModal}>
        Edit
      </Button>

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

              <Button
                type="button"
                className="closeButton"
                onClick={closeModal}
                disabled={editor.isSaving}
                aria-label="Закрыть окно"
              >
                ×
              </Button>
            </header>

            <form className={styles.form} onSubmit={editor.handleSubmit}>
              <div>
                <label className={styles.label} htmlFor="avatar">
                  Аватар
                </label>

                <div className={styles.avatarEditor}>
                  {avatar.avatarPreview && (
                    <Image
                      className={styles.avatarPreview}
                      src={avatar.avatarPreview}
                      alt="Предпросмотр нового аватара"
                      width={100}
                      height={100}
                    />
                  )}

                  <Input
                    id="avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onClick={(event) => {
                      event.currentTarget.value = "";
                    }}
                    onChange={avatar.handleAvatarChange}
                  />
                </div>
                <p className={styles.hint}>
                  Допустимые форматы: JPG, PNG или WebP.
                </p>

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

                <Input
                  id="username"
                  value={editor.username}
                  onChange={(event) => editor.setUsername(event.target.value)}
                  disabled={editor.isSaving}
                  autoComplete="username"
                />
              </div>

              {editor.message && (
                <p
                  className={`${styles.message} ${editor.isError ? styles.error : styles.success}`}
                  role={editor.isError ? "alert" : "status"}
                >
                  {editor.message}
                </p>
              )}

              <div className={styles.actions}>
                <Button
                  type="button"
                  className="cancelButton"
                  onClick={closeModal}
                  disabled={editor.isSaving}
                >
                  Отмена
                </Button>

                <Button
                  type="submit"
                  className="saveButton"
                  disabled={editor.isSaving}
                >
                  {editor.isSaving ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
};

export default UserInfoEditor;
