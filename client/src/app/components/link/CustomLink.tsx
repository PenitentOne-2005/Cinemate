import Link from "next/link";
import type { LinkProps } from "./interface";
import styles from "./CustomLink.module.css";

const CustomLink = ({ href, children }: LinkProps) => {
  return (
    <Link href={href} className={styles.link}>
      {children}
    </Link>
  );
};

export default CustomLink;
