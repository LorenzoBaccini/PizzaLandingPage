import type { ReactNode } from "react";

import styles from "../../style/Checkbox.module.css";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  children?: ReactNode;
}

export const Checkbox = ({ checked, onChange, children }: CheckboxProps) => {
  return (
    <label className={styles.label}>
      <input
        type="checkbox"
        className={styles.hiddenInput}
        checked={checked}
        onChange={onChange}
      />
      <span className={`${styles.box} ${checked ? styles.checked : ""}`}>
        {checked && <span className={styles.checkmark}>&#10003;</span>}
      </span>
      {children && <span className={styles.children}>{children}</span>}
    </label>
  );
};
