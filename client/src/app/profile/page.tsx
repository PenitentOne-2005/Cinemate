"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";
import { useAuth } from "../context/auth-context";

const ProfilePage = () => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, error, refreshUser } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !error) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, error, router]);

  if (isLoading) {
    return <main className={styles.profilePage}>Загрузка профиля...</main>;
  }

  if (error) {
    return (
      <main className={styles.profilePage}>
        <p role="alert">{error}</p>
        <button onClick={() => void refreshUser()}>Повторить</button>
      </main>
    );
  }

  if (!user) {
    return <main className={styles.profilePage}>Перенаправление...</main>;
  }

  return (
    <main className={styles.profilePage}>
      <section className={styles.profileCard}>
        <header className={styles.homeHeader}>
          <h1 className={styles.brandName}>Cinemeow</h1>

          <div className={styles.homeUser}>
            {user.avatar ? (
              <img className={styles.homeAvatar} src={user.avatar} alt="" />
            ) : (
              <div className={styles.homeAvatarPlaceholder} aria-hidden="true">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className={styles.homeUserInfo}>
              <p className={styles.homeUserName}>{user.name}</p>
              <p className={styles.homeUsername}>@{user.username}</p>
            </div>
          </div>
        </header>

        <div className={styles.homeContent}>
          <h2 className={styles.homeTitle}>Смотри вместе с друзьями</h2>

          <p className={styles.homeDescription}>
            Создай комнату или присоединись к друзьям, чтобы смотреть видео
            синхронно.
          </p>

          <div className={styles.homeActions}>
            <button
              className={styles.homeAction}
              onClick={() => {
                // Позже подключим создание комнаты.
              }}
            >
              Создать комнату
            </button>

            <button
              className={`${styles.homeAction} ${styles.homeActionSecondary}`}
              onClick={() => {
                // Позже подключим вход по коду комнаты.
              }}
            >
              Присоединиться к комнате
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
