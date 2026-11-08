import type { UserCardProps } from "./interface";
import styles from "./UserCard.module.css";

const UserCard = ({ user, children }: UserCardProps) => {
  return (
    <article className={styles.userCard}>
      <div className={styles.userInfo}>
        {user.avatar ? (
          <img className={styles.avatar} src={user.avatar} alt="" />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <p className={styles.userName}>{user.name}</p>
          <p className={styles.username}>
            @{user.username ?? "username не задан"}
          </p>
        </div>
      </div>

      {children}
    </article>
  );
};

export default UserCard;
