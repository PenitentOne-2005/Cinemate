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
          <h2 className={styles.sectionTitle}>Входящие заявки</h2>
          <p className={styles.sectionDescription}>
            Люди, которые хотят добавить тебя.
          </p>
        </div>

        <span className={styles.counter}>{requests.length}</span>
      </div>

      {isLoading ? (
        <p className={styles.emptyState}>Загрузка заявок...</p>
      ) : requests.length === 0 ? (
        <p className={styles.emptyState}>Пока нет входящих заявок.</p>
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
                  Принять
                </Button>

                <Button
                  type="button"
                  className="dangerButton"
                  onClick={() => onReject(request.user.id)}
                  disabled={busyUserId === request.user.id}
                >
                  Отклонить
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
