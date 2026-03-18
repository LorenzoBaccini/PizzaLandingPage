import type { ButtonHTMLAttributes } from "react";

import styles from "../../style/buttonStyles.module.css";

type ButtonVariant = "primary" | "primaryAlt" | "secondary" | "danger";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  label: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isActive?: boolean;
  className?: string;
  ariaSelected?: boolean;
}

export const Button = ({
  label,
  variant = "primary",
  size = "medium",
  isActive = false,
  onClick,
  type = "button",
  ariaSelected,
  role,
  className = "",
  ...props
}: ButtonProps) => {
  const baseClass = styles.buttonBase;
  const variantClass = styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`] || "";
  const sizeClass = styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`];
  const activeClass = isActive ? styles.buttonActive : "";

  const combinedClassName = [baseClass, variantClass, sizeClass, activeClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={combinedClassName}
      onClick={onClick}
      type={type}
      aria-selected={ariaSelected}
      role={role}
      {...props}
    >
      {label}
    </button>
  );
};
