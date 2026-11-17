import type { FriendsListProps } from "./interface";
import { Button } from "@/app/shared/components";
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
          <h2 className={styles.sectionTitle}>My friends</h2>
          <p className={styles.sectionDescription}>
            Your conversation partners and future cinephiles.
          </p>
        </div>

        <span className={styles.counter}>{friends.length}</span>
      </div>

      {isLoading ? (
        <p className={styles.emptyState}>Loading friends...</p>
      ) : friends.length === 0 ? (
        <p className={styles.emptyState}>
          There’s no one here yet. It’s the perfect time to make some friends!
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
                {busyUserId === item.friend.id ? "Processing..." : "Delete"}
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
        {isLoading ? "Update..." : "Update lists"}
      </Button>
    </section>
  );
};

export default FriendsList;
