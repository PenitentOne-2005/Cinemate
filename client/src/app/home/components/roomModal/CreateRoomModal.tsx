"use client";

import { useForm, useWatch } from "react-hook-form";
import { useEffect, useId, useRef } from "react";
import type { CreateRoomData } from "@/app/services/rooms/rooms.service.types";
import type { CreateRoomFormValues, CreateRoomModalProps } from "./interface";
import { Button, Input } from "@/app/shared/components";
import styles from "./CreateRoomModal.module.css";

const CreateRoomModal = ({
  friends,
  isCreating,
  onClose,
  onCreate,
}: CreateRoomModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const nameId = useId();
  const nameErrorId = `${nameId}-error`;
  const sourceUrlId = useId();
  const sourceUrlErrorId = `${sourceUrlId}-error`;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    getValues,
    formState: { errors, isValid },
  } = useForm<CreateRoomFormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      privacy: "everyone",
      source: "youtube",
      sourceUrl: "",
      invitedUserIds: [],
    },
  });

  const [watchedSource, watchedInvitedUserIds] = useWatch({
    control,
    name: ["source", "invitedUserIds"],
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    if (!dialog.open) dialog.showModal();
    dialog.querySelector<HTMLInputElement>('input[name="name"]')?.focus();

    return () => {
      if (dialog.open) dialog.close();
      previouslyFocused?.focus();
    };
  }, []);

  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();

    if (!isCreating) onClose();
  };

  const handleBackdropMouseDown = (
    event: React.MouseEvent<HTMLDialogElement>,
  ) => {
    if (event.target === event.currentTarget && !isCreating) {
      onClose();
    }
  };

  const handleFriendToggle = (userId: string) => {
    const currentIds = getValues("invitedUserIds");

    const nextIds = currentIds.includes(userId)
      ? currentIds.filter((id) => id !== userId)
      : [...currentIds, userId];

    setValue("invitedUserIds", nextIds, { shouldDirty: true });
  };

  const onSubmit = async (values: CreateRoomFormValues) => {
    clearErrors("root");

    const trimmedName = values.name.trim();

    if (!trimmedName) {
      setError("root", { message: "Room name is required." });
      return;
    }

    const data: CreateRoomData = {
      name: trimmedName,
      privacy: values.privacy,
      source: values.source,
      ...(values.source === "youtube" && {
        sourceUrl: values.sourceUrl.trim(),
      }),
      invitedUserIds: values.invitedUserIds,
    };

    try {
      const success = await onCreate(data);

      if (success) {
        onClose();
      }
    } catch {
      setError("root", {
        message: "Failed to create room. Please try again.",
      });
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      aria-labelledby="create-room-title"
      onCancel={handleCancel}
      onMouseDown={handleBackdropMouseDown}
    >
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 id="create-room-title">Create room</h2>

          <Button
            type="button"
            className="closeButton"
            onClick={onClose}
            disabled={isCreating}
            aria-label="Close window"
          >
            ×
          </Button>
        </header>

        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          aria-busy={isCreating}
          noValidate
        >
          <div className={styles.field}>
            <label htmlFor={nameId}>Room name</label>

            <Input
              id={nameId}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? nameErrorId : undefined}
              {...register("name", {
                required: "Room name is required.",
                maxLength: {
                  value: 100,
                  message: "Room name must be 100 characters or fewer.",
                },
                validate: (value) =>
                  value.trim().length > 0 || "Room name cannot be empty.",
              })}
              maxLength={100}
              placeholder="My movie night"
            />

            {errors.name && (
              <span id={nameErrorId} className={styles.error} role="alert">
                {errors.name.message}
              </span>
            )}
          </div>

          <label className={styles.field}>
            Privacy
            <select {...register("privacy")}>
              <option value="everyone">Everyone</option>
              <option value="friends">Friends only</option>
            </select>
          </label>

          <label className={styles.field}>
            Video source
            <select {...register("source")}>
              <option value="youtube">YouTube</option>
              <option value="drive">Google Drive</option>
            </select>
          </label>

          {watchedSource === "youtube" && (
            <div className={styles.field}>
              <label htmlFor={sourceUrlId}>YouTube video URL</label>
              <Input
                id={sourceUrlId}
                type="url"
                aria-invalid={errors.sourceUrl ? true : undefined}
                aria-describedby={
                  errors.sourceUrl ? sourceUrlErrorId : undefined
                }
                {...register("sourceUrl", {
                  required: "YouTube video URL is required.",
                })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {errors.sourceUrl && (
                <span
                  id={sourceUrlErrorId}
                  className={styles.error}
                  role="alert"
                >
                  {errors.sourceUrl.message}
                </span>
              )}
            </div>
          )}

          <fieldset className={styles.friendsField}>
            <legend>Invite friends</legend>

            {friends.length === 0 ? (
              <p className={styles.emptyText}>
                You do not have any friends yet.
              </p>
            ) : (
              friends.map(({ friend }) => (
                <label key={friend.id} className={styles.friendOption}>
                  <Input
                    type="checkbox"
                    checked={(watchedInvitedUserIds ?? []).includes(friend.id)}
                    onChange={() => handleFriendToggle(friend.id)}
                  />
                  <span>{friend.username ?? "Unknown user"}</span>
                </label>
              ))
            )}
          </fieldset>

          {errors.root?.message && (
            <p className={styles.error} role="alert">
              {errors.root.message}
            </p>
          )}

          <span className={styles.srOnly} role="status">
            {isCreating ? "Creating room..." : ""}
          </span>

          <footer className={styles.actions}>
            <Button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="cancelButton"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isCreating || !isValid}
              className="primaryButton"
            >
              {isCreating ? "Creating..." : "Create room"}
            </Button>
          </footer>
        </form>
      </div>
    </dialog>
  );
};

export default CreateRoomModal;
