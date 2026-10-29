"use client";

import { useCallback, useEffect, useState } from "react";
import { ProtectedRoute } from "@/app/components";
import { friendshipService } from "@/app/services";
import type {
  Friend,
  FriendRequest,
  FriendshipUser,
} from "../services/friendship/friendship.types";

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
    setIsLoading(true);
    setError("");

    try {
      const [friendsData, requestsData] = await Promise.all([
        friendshipService.getFriends(),
        friendshipService.getReceivedRequests(),
      ]);

      setFriends(friendsData);
      setReceivedRequests(requestsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось загрузить данные о друзьях.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFriendshipData();
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

    try {
      const result = await friendshipService.sendRequest(userId);
      setMessage(result.message || "Заявка отправлена.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось отправить заявку.",
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const handleAcceptRequest = async (requesterId: string) => {
    setBusyUserId(requesterId);
    setMessage("");
    setError("");

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
    }
  };

  const handleRejectRequest = async (requesterId: string) => {
    setBusyUserId(requesterId);
    setMessage("");
    setError("");

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
        <main>
          <h1>Home</h1>
          <p>Управление друзьями</p>

          {message && <p role="status">{message}</p>}
          {error && <p role="alert">{error}</p>}

          <section>
            <h2>Поиск пользователей</h2>

            <form onSubmit={handleSearch}>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Введите username"
                required
              />

              <button type="submit" disabled={isSearching}>
                {isSearching ? "Поиск..." : "Найти"}
              </button>
            </form>

            {searchResults.map((foundUser) => (
              <article key={foundUser.id}>
                <p>{foundUser.name}</p>
                <p>@{foundUser.username ?? "username не задан"}</p>

                <button
                  type="button"
                  onClick={() => void handleSendRequest(foundUser.id)}
                  disabled={busyUserId === foundUser.id}
                >
                  {busyUserId === foundUser.id
                    ? "Отправка..."
                    : "Добавить в друзья"}
                </button>
              </article>
            ))}
          </section>

          <section>
            <h2>Входящие заявки</h2>

            {isLoading ? (
              <p>Загрузка заявок...</p>
            ) : receivedRequests.length === 0 ? (
              <p>Входящих заявок нет.</p>
            ) : (
              receivedRequests.map((request) => (
                <article key={request.requestId}>
                  <p>{request.user.name}</p>
                  <p>@{request.user.username ?? "username не задан"}</p>

                  <button
                    type="button"
                    onClick={() => void handleAcceptRequest(request.user.id)}
                    disabled={busyUserId === request.user.id}
                  >
                    Принять
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleRejectRequest(request.user.id)}
                    disabled={busyUserId === request.user.id}
                  >
                    Отклонить
                  </button>
                </article>
              ))
            )}
          </section>

          <section>
            <h2>Мои друзья</h2>

            {isLoading ? (
              <p>Загрузка друзей...</p>
            ) : friends.length === 0 ? (
              <p>Пока нет друзей.</p>
            ) : (
              friends.map((item) => (
                <article key={item.friendshipId}>
                  <p>{item.friend.name}</p>
                  <p>@{item.friend.username ?? "username не задан"}</p>

                  <button
                    type="button"
                    onClick={() => void handleRemoveFriend(item.friend.id)}
                    disabled={busyUserId === item.friend.id}
                  >
                    {busyUserId === item.friend.id
                      ? "Обработка..."
                      : "Удалить из друзей"}
                  </button>
                </article>
              ))
            )}

            <button
              type="button"
              onClick={() => void loadFriendshipData()}
              disabled={isLoading}
            >
              Обновить списки
            </button>
          </section>
        </main>
      )}
    </ProtectedRoute>
  );
};

export default HomePage;
