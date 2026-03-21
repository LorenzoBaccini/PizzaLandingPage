import type { ReactNode } from "react";

import styles from "../../style/Radio.module.css";

interface RadioProps {
  value: string;
  selected: boolean;
  onChange: (value: string) => void;
  children?: ReactNode;
}

export const Radio = ({ value, selected, onChange, children }: RadioProps) => {
  return (
    <label className={styles.label}>
      <input
        type="radio"
        className={styles.hiddenInput}
        checked={selected}
        onChange={() => onChange(value)}
      />
      <span className={`${styles.circle} ${selected ? styles.selected : ""}`}>
        {selected && <span className={styles.dot} />}
      </span>
      {children && <span className={styles.children}>{children}</span>}
    </label>
  );
};
