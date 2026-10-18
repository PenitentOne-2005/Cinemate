"use client";

import styles from "./auth-status.module.css";
import { AuthStatusProps } from "./interface";

const AuthStatus = ({ isLoading, error, onRetry }: AuthStatusProps) => {
  if (isLoading) {
    return <main className={styles.status}>Проверка авторизации...</main>;
  }

  if (error) {
    return (
      <main className={styles.status}>
        <p role="alert">{error}</p>
        <button onClick={onRetry}>Повторить</button>
      </main>
    );
  }
};

export default AuthStatus;
