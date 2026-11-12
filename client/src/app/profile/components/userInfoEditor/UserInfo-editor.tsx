"use client";

import { useId, useRef, type FormEvent } from "react";
import Image from "next/image";
import type { UserInfoEditorProps } from "./interface";
import { useUserInfoEditor, useAvatarUpload } from "./hooks";
import { Input, Button } from "@/app/shared/components";
import styles from "./userinfo-editor.module.css";

const UserInfoEditor = ({ user }: UserInfoEditorProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const titleId = useId();
  const avatarId = useId();
  const avatarHintId = useId();
  const avatarErrorId = useId();
  const usernameId = useId();

  const avatar = useAvatarUpload();

  const editor = useUserInfoEditor({
    user,
    avatarFile: avatar.avatarFile,
    clearAvatarSelection: avatar.clearAvatarSelection,
    onSuccess: () => {
      avatar.clearAvatarSelection();
      dialogRef.current?.close();
    },
  });

  function openModal() {
    editor.resetForm();
    editor.setUsername(user.username);

    dialogRef.current?.showModal();

    dialogRef.current
      ?.querySelector<HTMLInputElement>(`[id="${usernameId}"]`)
      ?.focus();
  }

  function closeModal() {
    if (editor.isSaving) return;

    avatar.clearAvatarSelection();
    editor.resetForm();

    dialogRef.current?.close();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (editor.isSaving) {
      event.preventDefault();
      return;
    }

    editor.handleSubmit(event);
  }

  const avatarDescribedBy = avatar.avatarError
    ? `${avatarHintId} ${avatarErrorId}`
    : avatarHintId;

  return (
    <>
      <Button
        type="button"
        className="editButton"
        onClick={openModal}
        aria-haspopup="dialog"
      >
        Редактировать профиль
      </Button>

      <dialog
        ref={dialogRef}
        className={styles.modal}
        aria-labelledby={titleId}
        onCancel={(event) => {
          event.preventDefault();
          closeModal();
        }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            closeModal();
          }
        }}
      >
        <div className={styles.modalInner}>
          <header className={styles.modalHeader}>
            <h2 id={titleId}>Редактировать профиль</h2>

            <Button
              type="button"
              className="closeButton"
              onClick={closeModal}
              disabled={editor.isSaving}
              aria-label="Закрыть окно"
            >
              <span aria-hidden="true">×</span>
            </Button>
          </header>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            aria-busy={editor.isSaving}
          >
            <div>
              <label className={styles.label} htmlFor={avatarId}>
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
                  id={avatarId}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={editor.isSaving}
                  aria-describedby={avatarDescribedBy}
                  aria-invalid={Boolean(avatar.avatarError)}
                  onClick={(event) => {
                    event.currentTarget.value = "";
                  }}
                  onChange={avatar.handleAvatarChange}
                />
              </div>

              <p id={avatarHintId} className={styles.hint}>
                Допустимые форматы: JPG, PNG или WebP.
              </p>

              {avatar.avatarError && (
                <p id={avatarErrorId} role="alert" className={styles.error}>
                  {avatar.avatarError}
                </p>
              )}
            </div>

            <div>
              <label className={styles.label} htmlFor={usernameId}>
                Имя пользователя
              </label>

              <Input
                id={usernameId}
                value={editor.username}
                onChange={(event) => editor.setUsername(event.target.value)}
                readOnly={editor.isSaving}
                autoComplete="nickname"
              />
            </div>

            <p role="alert" className={`${styles.message} ${styles.error}`}>
              {editor.isError ? editor.message : null}
            </p>

            <p role="status" className={`${styles.message} ${styles.success}`}>
              {!editor.isError ? editor.message : null}
            </p>

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
                aria-disabled={editor.isSaving}
              >
                {editor.isSaving ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default UserInfoEditor;
