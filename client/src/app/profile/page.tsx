"use client";

import { ProtectedRoute } from "@/app/components";
import { UsernameEditor } from "./components";
import styles from "./profile.module.css";

const ProfilePage = () => {
  return (
    <ProtectedRoute>
      {(user) => (
        <main className={styles.profilePage}>
          <section className={styles.profileCard}>
            <UsernameEditor user={user} />

            <div className={styles.profileInfo}>
              {user.avatar ? (
                <img
                  className={styles.profileAvatar}
                  src={user.avatar}
                  alt={`Аватар ${user.name}`}
                />
              ) : (
                <div
                  className={styles.profileAvatarPlaceholder}
                  aria-hidden="true"
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              <h1 className={styles.profileName}>{user.name}</h1>
              <p className={styles.profileUsername}>@{user.username}</p>
            </div>
          </section>
        </main>
      )}
    </ProtectedRoute>
  );
};

export default ProfilePage;
