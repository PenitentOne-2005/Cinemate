import { Button } from "@/app/shared/components";
import type { RoomsSectionProps } from "./interface";
import styles from "./RoomsSection.module.css";

const RoomsSection = ({
  myRooms,
  invitedRooms,
  publicRooms,
  isLoading,
  busyRoomId,
  onDeleteRoom,
  onOpenCreateRoom,
}: RoomsSectionProps) => {
  const myRoomIds = new Set(myRooms.map((room) => room.id));

  const availablePublicRooms = publicRooms.filter(
    (room) => !myRoomIds.has(room.id),
  );

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Rooms</h2>

      <div className={styles.group}>
        <div className={styles.groupHeader}>
          <div>
            <h3 className={styles.groupTitle}>My rooms</h3>

            <p className={styles.groupSubtitle}>
              Rooms you created and manage.
            </p>

            <Button
              type="button"
              onClick={onOpenCreateRoom}
              className="primaryButton"
            >
              Create room
            </Button>
          </div>
          <span className={styles.badge}>{myRooms.length}</span>
        </div>

        {!isLoading && myRooms.length === 0 && (
          <p className={styles.emptyMessage}>
            You have not created any rooms yet.
          </p>
        )}

        {myRooms.length > 0 && (
          <div className={styles.roomsGrid}>
            {myRooms.map((room) => (
              <article className={styles.roomCard} key={room.id}>
                <h4 className={styles.roomName}>{room.name}</h4>
                <p className={styles.roomInfo}>
                  <span>Privacy: {room.privacy}</span>
                  <span>Source: {room.source}</span>
                </p>

                <button
                  className={styles.deleteButton}
                  type="button"
                  disabled={busyRoomId === room.id}
                  onClick={() => onDeleteRoom(room.id)}
                >
                  {busyRoomId === room.id ? "Deleting..." : "Delete"}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className={styles.group}>
        <div className={styles.groupHeader}>
          <div>
            <h3 className={styles.groupTitle}>Invitations</h3>
            <p className={styles.groupSubtitle}>
              Rooms you have been invited to join.
            </p>
          </div>
          <span className={styles.badge}>{invitedRooms.length}</span>
        </div>

        {!isLoading && invitedRooms.length === 0 && (
          <p className={styles.emptyMessage}>
            You do not have any room invitations.
          </p>
        )}

        {invitedRooms.length > 0 && (
          <div className={styles.roomsGrid}>
            {invitedRooms.map((room) => (
              <article className={styles.roomCard} key={room.id}>
                <h4 className={styles.roomName}>{room.name}</h4>
                <p className={styles.roomInfo}>
                  <span>Owner: {room.owner.username ?? "Unknown user"}</span>
                  <span>Source: {room.source}</span>
                </p>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className={styles.group}>
        <div className={styles.groupHeader}>
          <div>
            <h3 className={styles.groupTitle}>Public rooms</h3>
            <p className={styles.groupSubtitle}>
              Open rooms available to explore.
            </p>
          </div>
          <span className={styles.badge}>{availablePublicRooms.length}</span>
        </div>

        {!isLoading && availablePublicRooms.length === 0 && (
          <p className={styles.emptyMessage}>
            There are no public rooms available.
          </p>
        )}

        {availablePublicRooms.length > 0 && (
          <div className={styles.roomsGrid}>
            {availablePublicRooms.map((room) => (
              <article className={styles.roomCard} key={room.id}>
                <h4 className={styles.roomName}>{room.name}</h4>
                <p className={styles.roomInfo}>
                  <span>Owner: {room.owner.username ?? "Unknown user"}</span>
                  <span>Source: {room.source}</span>
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RoomsSection;
