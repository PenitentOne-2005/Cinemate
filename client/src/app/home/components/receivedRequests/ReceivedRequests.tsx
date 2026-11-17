import type { ReceivedRequestsProps } from "./interface";
import { Button } from "@/app/shared/components";
import { UserCard } from "../index";
import styles from "./ReceivedRequests.module.css";

const ReceivedRequests = ({
  requests,
  isLoading,
  busyUserId,
  onAccept,
  onReject,
}: ReceivedRequestsProps) => {
  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Incoming requests</h2>
          <p className={styles.sectionDescription}>
            People who want to add you.
          </p>
        </div>

        <span className={styles.counter}>{requests.length}</span>
      </div>

      {isLoading ? (
        <p className={styles.emptyState}>Uploading applications...</p>
      ) : requests.length === 0 ? (
        <p className={styles.emptyState}>No incoming requests yet.</p>
      ) : (
        <div className={styles.userList}>
          {requests.map((request) => (
            <UserCard key={request.requestId} user={request.user}>
              <div className={styles.actions}>
                <Button
                  type="button"
                  className="primaryButton"
                  onClick={() => onAccept(request.user.id)}
                  disabled={busyUserId === request.user.id}
                >
                  Accept
                </Button>

                <Button
                  type="button"
                  className="dangerButton"
                  onClick={() => onReject(request.user.id)}
                  disabled={busyUserId === request.user.id}
                >
                  Decline
                </Button>
              </div>
            </UserCard>
          ))}
        </div>
      )}
    </section>
  );
};

export default ReceivedRequests;
