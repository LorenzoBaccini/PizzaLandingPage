import type { ReactNode } from "react";

import styles from "../../style/Radio.module.css";

interface RadioGroupProps {
  children: ReactNode;
}

export const RadioGroup = ({ children }: RadioGroupProps) => {
  return <div className={styles.group}>{children}</div>;
};
