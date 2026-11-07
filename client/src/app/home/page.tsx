"use client";

import { useCallback, useEffect, useState } from "react";
import { ProtectedRoute } from "@/app/components";
import { friendshipService } from "@/app/services";
import type {
  Friend,
  FriendRequest,
  FriendshipUser,
} from "../services/friendship/friendship.types";
import styles from "./page.module.css";

const HomePage = () => {
  const [username, setUsername] = useState("");
  const [searchResults, setSearchResults] = useState<FriendshipUser[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadFriendshipData = useCallback(async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        friendshipService.getFriends(),
        friendshipService.getReceivedRequests(),
      ]);

      setFriends(friendsData);
      setReceivedRequests(requestsData);

      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось загрузить данные о друзьях.",
      );

      return false;
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      const success = await loadFriendshipData();

      if (!ignore) {
        setIsLoading(false);
      }
    };

    void loadData();

    return () => {
      ignore = true;
    };
  }, [loadFriendshipData]);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSearchResults([]);
    setIsSearching(true);

    try {
      const results = await friendshipService.searchUsers(username);
      setSearchResults(results);

      if (results.length === 0) {
        setMessage("Пользователь не найден.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось найти пользователя.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    setBusyUserId(userId);
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const result = await friendshipService.sendRequest(userId);
      setMessage(result.message || "Заявка отправлена.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось отправить заявку.",
      );
    } finally {
      setBusyUserId(null);
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requesterId: string) => {
    setBusyUserId(requesterId);
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const result = await friendshipService.acceptRequest(requesterId);
      setMessage(result.message || "Заявка принята.");
      await loadFriendshipData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось принять заявку.",
      );
    } finally {
      setBusyUserId(null);
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async (requesterId: string) => {
    setBusyUserId(requesterId);
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const result = await friendshipService.rejectRequest(requesterId);
      setMessage(result.message || "Заявка отклонена.");
      await loadFriendshipData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось отклонить заявку.",
      );
    } finally {
      setBusyUserId(null);
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    const confirmed = window.confirm(
      "Ты действительно хочешь удалить этого пользователя из друзей?",
    );

    if (!confirmed) {
      return;
    }

    setBusyUserId(friendId);
    setMessage("");
    setError("");

    try {
      const result = await friendshipService.removeFriend(friendId);
      setMessage(result.message || "Пользователь удалён из друзей.");
      await loadFriendshipData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось удалить друга.",
      );
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <ProtectedRoute>
      {() => (
        <main className={styles.page}>
          <div className={styles.container}>
            <header className={styles.header}>
              <div>
                <span className={styles.eyebrow}>CINEMEOW</span>
                <h1 className={styles.title}>Главная страница</h1>
                <p className={styles.subtitle}>
                  Найди друзей и смотри фильмы вместе.
                </p>
              </div>
            </header>

            {message && (
              <p className={styles.success} role="status">
                {message}
              </p>
            )}

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <section className={styles.panel}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Поиск пользователей</h2>
                  <p className={styles.sectionDescription}>
                    Найди человека по его username.
                  </p>
                </div>
              </div>

              <form className={styles.searchForm} onSubmit={handleSearch}>
                <input
                  className={styles.input}
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
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
                  {searchResults.map((foundUser) => (
                    <article className={styles.userCard} key={foundUser.id}>
                      <div className={styles.userInfo}>
                        {foundUser.avatar ? (
                          <img
                            className={styles.avatar}
                            src={foundUser.avatar}
                            alt=""
                          />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {foundUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <p className={styles.userName}>{foundUser.name}</p>
                          <p className={styles.username}>
                            @{foundUser.username ?? "username не задан"}
                          </p>
                        </div>
                      </div>

                      <button
                        className={styles.primaryButton}
                        type="button"
                        onClick={() => void handleSendRequest(foundUser.id)}
                        disabled={busyUserId === foundUser.id}
                      >
                        {busyUserId === foundUser.id
                          ? "Отправка..."
                          : "Добавить"}
                      </button>
                    </article>
                  ))}
                </div>
              )}

              {searchResults.length === 0 &&
                message === "Пользователь не найден." && (
                  <p className={styles.emptyState}>Пользователь не найден.</p>
                )}
            </section>

            <div className={styles.contentGrid}>
              <section className={styles.panel}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Входящие заявки</h2>
                    <p className={styles.sectionDescription}>
                      Люди, которые хотят добавить тебя.
                    </p>
                  </div>

                  <span className={styles.counter}>
                    {receivedRequests.length}
                  </span>
                </div>

                {isLoading ? (
                  <p className={styles.emptyState}>Загрузка заявок...</p>
                ) : receivedRequests.length === 0 ? (
                  <p className={styles.emptyState}>Пока нет входящих заявок.</p>
                ) : (
                  <div className={styles.userList}>
                    {receivedRequests.map((request) => (
                      <article
                        className={styles.userCard}
                        key={request.requestId}
                      >
                        <div className={styles.userInfo}>
                          {request.user.avatar ? (
                            <img
                              className={styles.avatar}
                              src={request.user.avatar}
                              alt=""
                            />
                          ) : (
                            <div className={styles.avatarPlaceholder}>
                              {request.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <p className={styles.userName}>
                              {request.user.name}
                            </p>
                            <p className={styles.username}>
                              @{request.user.username ?? "username не задан"}
                            </p>
                          </div>
                        </div>

                        <div className={styles.actions}>
                          <button
                            className={styles.primaryButton}
                            type="button"
                            onClick={() =>
                              void handleAcceptRequest(request.user.id)
                            }
                            disabled={busyUserId === request.user.id}
                          >
                            Принять
                          </button>

                          <button
                            className={styles.dangerButton}
                            type="button"
                            onClick={() =>
                              void handleRejectRequest(request.user.id)
                            }
                            disabled={busyUserId === request.user.id}
                          >
                            Отклонить
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

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
                      <article
                        className={styles.userCard}
                        key={item.friendshipId}
                      >
                        <div className={styles.userInfo}>
                          {item.friend.avatar ? (
                            <img
                              className={styles.avatar}
                              src={item.friend.avatar}
                              alt=""
                            />
                          ) : (
                            <div className={styles.avatarPlaceholder}>
                              {item.friend.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <p className={styles.userName}>
                              {item.friend.name}
                            </p>
                            <p className={styles.username}>
                              @{item.friend.username ?? "username не задан"}
                            </p>
                          </div>
                        </div>

                        <button
                          className={styles.dangerButton}
                          type="button"
                          onClick={() =>
                            void handleRemoveFriend(item.friend.id)
                          }
                          disabled={busyUserId === item.friend.id}
                        >
                          {busyUserId === item.friend.id
                            ? "Обработка..."
                            : "Удалить"}
                        </button>
                      </article>
                    ))}
                  </div>
                )}

                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => void loadFriendshipData()}
                  disabled={isLoading}
                >
                  {isLoading ? "Обновление..." : "Обновить списки"}
                </button>
              </section>
            </div>
          </div>
        </main>
      )}
    </ProtectedRoute>
  );
};

export default HomePage;
