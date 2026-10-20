"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ALLOWED_TYPES, MAX_FILE_SIZE } from "./constants";

const useAvatarUpload = () => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const previewUrlRef = useRef<string | null>(null);

  const clearAvatarSelection = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError(null);
  }, []);

  const handleAvatarChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0];

      if (!file) return;

      setAvatarError(null);

      if (!ALLOWED_TYPES.includes(file.type)) {
        setAvatarError("Разрешены только JPEG, PNG и WebP.");
        event.currentTarget.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setAvatarError("Размер изображения не должен превышать 5 МБ.");
        event.currentTarget.value = "";
        return;
      }

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      const previewUrl = URL.createObjectURL(file);

      previewUrlRef.current = previewUrl;
      setAvatarFile(file);
      setAvatarPreview(previewUrl);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  return {
    avatarFile,
    avatarPreview,
    avatarError,
    handleAvatarChange,
    clearAvatarSelection,
  };
};

export default useAvatarUpload;
