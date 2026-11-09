import type { FriendsListProps } from "./interface";
import { Button } from "@/app/components";
import { UserCard } from "../index";
import styles from "./FriendsList.module.css";

const FriendsList = ({
  friends,
  isLoading,
  busyUserId,
  onRemove,
  onRefresh,
}: FriendsListProps) => {
  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Мои друзья</h2>
          <p className={styles.sectionDescription}>
            Твои собеседники и будущие киноманы.
          </p>
        </div>

        <span className={styles.counter}>{friends.length}</span>
      </div>

      {isLoading ? (
        <p className={styles.emptyState}>Загрузка друзей...</p>
      ) : friends.length === 0 ? (
        <p className={styles.emptyState}>
          Здесь пока никого нет. Самое время найти друзей!
        </p>
      ) : (
        <div className={styles.userList}>
          {friends.map((item) => (
            <UserCard key={item.friendshipId} user={item.friend}>
              <Button
                type="button"
                className="dangerButton"
                onClick={() => onRemove(item.friend.id)}
                disabled={busyUserId === item.friend.id}
              >
                {busyUserId === item.friend.id ? "Обработка..." : "Удалить"}
              </Button>
            </UserCard>
          ))}
        </div>
      )}

      <Button
        type="button"
        className="secondaryButton"
        onClick={onRefresh}
        disabled={isLoading}
      >
        {isLoading ? "Обновление..." : "Обновить списки"}
      </Button>
    </section>
  );
};

export default FriendsList;
