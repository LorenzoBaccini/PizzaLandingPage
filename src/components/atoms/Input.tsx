import type { InputHTMLAttributes } from "react";

import styles from "../../style/Input.module.css";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  error?: boolean;
}

export const Input = ({ error, ...props }: InputProps) => {
  return (
    <input
      className={`${styles.input} ${error ? styles.error : ""}`}
      {...props}
    />
  );
};
