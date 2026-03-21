import type { ReactNode } from "react";

import styles from "../../style/Collapse.module.css";

interface CollapseProps {
  isOpen: boolean;
  onToggle: () => void;
  header: ReactNode;
  children: ReactNode;
  style?: React.CSSProperties;
}

export const Collapse = ({ isOpen, onToggle, header, children, style }: CollapseProps) => {
  return (
    <div className={styles.collapse} style={style}>
      <button className={styles.header} onClick={onToggle} type="button">
        <div style={{ flex: 1 }}>{header}</div>
        <span className={`${styles.chevron} ${isOpen ? styles.open : ""}`}>&#9660;</span>
      </button>
      <div className={`${styles.content} ${isOpen ? styles.open : ""}`}>
        <div className={styles.contentInner}>{children}</div>
      </div>
    </div>
  );
};
