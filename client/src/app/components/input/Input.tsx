import type { InputProps } from "./interface";
import styles from "./Input.module.css";

const Input = ({ className, ...props }: InputProps) => {
  return <input className={`${styles.input} ${className ?? ""}`} {...props} />;
};

export default Input;
