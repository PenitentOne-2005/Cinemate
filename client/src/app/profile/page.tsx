"use client";

import { ProtectedRoute } from "@/app/components";
import styles from "./profile.module.css";

const ProfilePage = () => {
  return (
    <ProtectedRoute>
      {(user) => (
        <main className={styles.profilePage}>
          <section className={styles.profileCard}>
            <header className={styles.homeHeader}>
              <h1 className={styles.brandName}>Cinemeow</h1>

              <div className={styles.homeUser}>
                {user.avatar ? (
                  <img className={styles.homeAvatar} src={user.avatar} alt="" />
                ) : (
                  <div
                    className={styles.homeAvatarPlaceholder}
                    aria-hidden="true"
                  >
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
      )}
    </ProtectedRoute>
  );
};

export default ProfilePage;
