import type { ButtonProps } from "./interface";
import styles from "./Button.module.css";

const Button = ({ children, className, type, ...props }: ButtonProps) => {
  return (
    <button type={type} className={styles[className]} {...props}>
      {children}
    </button>
  );
};

export default Button;
