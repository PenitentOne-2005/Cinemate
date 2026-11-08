import type { UserSearchProps } from "./interface";
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
          <h2 className={styles.sectionTitle}>Поиск пользователей</h2>
          <p className={styles.sectionDescription}>
            Найди человека по его username.
          </p>
        </div>
      </div>

      <form className={styles.searchForm} onSubmit={onSearch}>
        <input
          className={styles.input}
          id="username"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          placeholder="Например, alex123"
          required
        />

        <button
          className={styles.primaryButton}
          type="submit"
          disabled={isSearching}
        >
          {isSearching ? "Поиск..." : "Найти"}
        </button>
      </form>

      {searchResults.length > 0 && (
        <div className={styles.userList}>
          {searchResults.map((user) => (
            <UserCard key={user.id} user={user}>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => onSendRequest(user.id)}
                disabled={busyUserId === user.id}
              >
                {busyUserId === user.id ? "Отправка..." : "Добавить"}
              </button>
            </UserCard>
          ))}
        </div>
      )}

      {hasSearched && searchResults.length === 0 && (
        <p className={styles.emptyState}>Пользователь не найден.</p>
      )}
    </section>
  );
};

export default UserSearch;
