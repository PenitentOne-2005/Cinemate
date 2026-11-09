"use client";

import Link from "next/link";
import type { ProfileClientProps } from "./interface";
import { UsernameEditor } from "./components";
import styles from "./profile.module.css";

const ProfileClient = ({ user }: ProfileClientProps) => {
  return (
    <main className={styles.profilePage}>
      <section className={styles.profileCard}>
        <Link href="/home">Home</Link>

        <UsernameEditor user={user} />

        <div className={styles.profileInfo}>
          {user.avatar ? (
            <img
              className={styles.profileAvatar}
              src={user.avatar}
              alt={`Аватар ${user.name}`}
            />
          ) : (
            <div className={styles.profileAvatarPlaceholder} aria-hidden="true">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className={styles.profileName}>{user.name}</h1>
          <p className={styles.profileUsername}>@{user.username}</p>
        </div>
      </section>
    </main>
  );
};

export default ProfileClient;
