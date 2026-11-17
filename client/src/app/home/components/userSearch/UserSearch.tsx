import type { UserSearchProps } from "./interface";
import { Button, Input } from "@/app/shared/components";
import { UserCard } from "../index";
import styles from "./UserSearch.module.css";

const UserSearch = ({
  username,
  searchResults,
  hasSearched,
  isSearching,
  busyUserId,
  onUsernameChange,
  onSearch,
  onSendRequest,
}: UserSearchProps) => {
  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Search for users</h2>
          <p className={styles.sectionDescription}>
            Find a person by their username.
          </p>
        </div>
      </div>

      <form className={styles.searchForm} onSubmit={onSearch}>
        <Input
          id="username"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          placeholder="For example, alex123"
          required
        />

        <Button type="submit" className="primaryButton" disabled={isSearching}>
          {isSearching ? "Search..." : "Find"}
        </Button>
      </form>

      {searchResults.length > 0 && (
        <div className={styles.userList}>
          {searchResults.map((user) => (
            <UserCard key={user.id} user={user}>
              <Button
                type="button"
                className="primaryButton"
                onClick={() => onSendRequest(user.id)}
                disabled={busyUserId === user.id}
              >
                {busyUserId === user.id ? "Dispatch..." : "Add"}
              </Button>
            </UserCard>
          ))}
        </div>
      )}

      {hasSearched && searchResults.length === 0 && (
        <p className={styles.emptyState}>User not found.</p>
      )}
    </section>
  );
};

export default UserSearch;
