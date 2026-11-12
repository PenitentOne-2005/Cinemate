"use client";

import type { HomePageProps } from "./interface";
import { useFriendships } from "./hooks";
import { CustomLink } from "../shared/components";
import { FriendsList, ReceivedRequests, UserSearch } from "./components";
import styles from "./page.module.css";

const HomePage = ({ initialFriends, initialRequests }: HomePageProps) => {
  const {
    username,
    friends,
    receivedRequests,
    setUsername,
    searchResults,
    hasSearched,
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
  } = useFriendships({ initialFriends, initialRequests });

  return (
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

          <CustomLink href="/profile">Профиль</CustomLink>
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

        <UserSearch
          username={username}
          searchResults={searchResults}
          hasSearched={hasSearched}
          isSearching={isSearching}
          busyUserId={busyUserId}
          onUsernameChange={setUsername}
          onSearch={handleSearch}
          onSendRequest={handleSendRequest}
        />

        <div className={styles.contentGrid}>
          <ReceivedRequests
            requests={receivedRequests}
            isLoading={isLoading}
            busyUserId={busyUserId}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />

          <FriendsList
            friends={friends}
            isLoading={isLoading}
            busyUserId={busyUserId}
            onRemove={handleRemoveFriend}
            onRefresh={refreshFriendshipData}
          />
        </div>
      </div>
    </main>
  );
};

export default HomePage;
