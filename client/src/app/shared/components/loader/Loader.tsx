import styles from "./Loader.module.css";

const Loader = () => {
  return (
    <div className={styles.loaderWrapper}>
      <span className={styles.spinner} role="status" />
    </div>
  );
};

export default Loader;
