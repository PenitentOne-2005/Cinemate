"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/auth-context";
import styles from "./page.module.css";

const Auth = () => {
  const router = useRouter();
  const { isLoading, isAuthenticated, error, refreshUser } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/profile");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <main className={styles.authPage}>Проверка авторизации...</main>;
  }

  if (error) {
    return (
      <main className={styles.authPage}>
        <section className={styles.authCard}>
          <p role="alert">{error}</p>
          <button onClick={() => void refreshUser()}>Повторить</button>
        </section>
      </main>
    );
  }

  if (isAuthenticated) {
    return <main className={styles.authPage}>Перенаправление...</main>;
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard}>
        <div className={styles.brandIcon} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="32"
            height="32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <h1 className={styles.brandName}>Cinemeow</h1>

        <p className={styles.brandDescription}>
          Смотри вместе. Даже на расстоянии.
        </p>

        <div className={styles.authContent}>
          <h2>Добро пожаловать</h2>

          <p className={styles.authDescription}>
            Войди, чтобы смотреть видео вместе с друзьями.
          </p>

          <a
            className={styles.googleButton}
            href="http://localhost:3000/auth/google"
          >
            <svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.61l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                transform="translate(0 4)"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.75 7.18l7.73 6C44.43 37.95 46.98 31.8 46.98 24.55Z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z"
                transform="translate(0 4)"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                transform="translate(0 -4)"
              />
            </svg>
            <span>Продолжить с Google</span>
          </a>
        </div>

        <p className={styles.authTerms}>
          Продолжая, ты соглашаешься с условиями использования и политикой
          конфиденциальности.
        </p>
      </section>
    </main>
  );
};

export default Auth;
