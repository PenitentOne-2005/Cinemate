"use client";

import { useState } from "react";
import type { HomePageProps } from "./interface";
import { useFriendships, useRooms } from "./hooks";
import { CustomLink } from "../shared/components";
import {
  FriendsList,
  ReceivedRequests,
  RoomsSection,
  UserSearch,
  CreateRoomModal,
} from "./components";
import styles from "./page.module.css";

const HomePage = ({
  initialFriends,
  initialRequests,
  initialMyRooms,
  initialInvitedRooms,
  initialPublicRooms,
}: HomePageProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const {
    myRooms,
    invitedRooms,
    publicRooms,
    isLoading: isRoomsLoading,
    isCreating,
    busyRoomId,
    message: roomsMessage,
    error: roomsError,
    handleCreateRoom,
    handleDeleteRoom,
    refreshRooms,
  } = useRooms({
    initialMyRooms,
    initialInvitedRooms,
    initialPublicRooms,
  });

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>CINEMEOW</span>
            <h1 className={styles.title}>Home page</h1>
            <p className={styles.subtitle}>
              Find friends and watch movies together.
            </p>
          </div>

          <CustomLink href="/profile">Profile</CustomLink>
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

        {isCreateModalOpen && (
          <CreateRoomModal
            friends={friends}
            isCreating={isCreating}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateRoom}
          />
        )}

        <RoomsSection
          myRooms={myRooms}
          invitedRooms={invitedRooms}
          publicRooms={publicRooms}
          isLoading={isRoomsLoading}
          busyRoomId={busyRoomId}
          onDeleteRoom={handleDeleteRoom}
          onOpenCreateRoom={() => setIsCreateModalOpen(true)}
        />

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
