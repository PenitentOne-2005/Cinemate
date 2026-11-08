import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { friendshipService } from "@/app/services";
import type {
  Friend,
  FriendRequest,
  FriendshipUser,
} from "@/app/services/friendship/friendship.types";

const useFriendships = () => {
  const [username, setUsername] = useState("");
  const [searchResults, setSearchResults] = useState<FriendshipUser[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

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
    const loadData = async () => {
      await loadFriendshipData();
      setIsLoading(false);
    };

    void loadData();
  }, [loadFriendshipData]);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setSearchResults([]);
    setHasSearched(false);
    setIsSearching(true);

    try {
      const results = await friendshipService.searchUsers(username);

      setSearchResults(results);
      setHasSearched(true);

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

  const runFriendshipAction = async (
    userId: string,
    action: () => Promise<{ message: string }>,
    fallbackMessage: string,
    shouldReload = false,
  ) => {
    setBusyUserId(userId);
    setMessage("");
    setError("");

    try {
      const result = await action();
      setMessage(result.message || fallbackMessage);

      if (shouldReload) {
        setIsLoading(true);
        await loadFriendshipData();
        setIsLoading(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось выполнить действие.",
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const handleSendRequest = (userId: string) =>
    runFriendshipAction(
      userId,
      () => friendshipService.sendRequest(userId),
      "Заявка отправлена.",
    );

  const handleAcceptRequest = (requesterId: string) =>
    runFriendshipAction(
      requesterId,
      () => friendshipService.acceptRequest(requesterId),
      "Заявка принята.",
      true,
    );

  const handleRejectRequest = (requesterId: string) =>
    runFriendshipAction(
      requesterId,
      () => friendshipService.rejectRequest(requesterId),
      "Заявка отклонена.",
      true,
    );

  const handleRemoveFriend = (friendId: string) => {
    const confirmed = window.confirm(
      "Ты действительно хочешь удалить этого пользователя из друзей?",
    );

    if (!confirmed) return;

    return runFriendshipAction(
      friendId,
      () => friendshipService.removeFriend(friendId),
      "Пользователь удалён из друзей.",
      true,
    );
  };

  const refreshFriendshipData = async () => {
    setIsLoading(true);
    await loadFriendshipData();
    setIsLoading(false);
  };

  return {
    username,
    setUsername,
    searchResults,
    hasSearched,
    friends,
    receivedRequests,
    isLoading,
    isSearching,
    busyUserId,
    message,
    error,
    handleSearch,
    handleSendRequest,
    handleAcceptRequest,
    handleRejectRequest,
    handleRemoveFriend,
    refreshFriendshipData,
  };
};

export default useFriendships;
