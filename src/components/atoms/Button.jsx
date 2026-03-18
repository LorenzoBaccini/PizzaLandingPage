import React from "react";
import styles from '../../style/buttonStyles.module.css';

const Button = ({
  label,
  variant = "primary",
  size = "medium",         // default size
  isActive = false,
  onClick,
  type = "button",
  ariaSelected,
  role,
  className = "",
  ...props
}) => {
  const baseClass = styles.buttonBase;

  // Classe variante (sempre presente)
  const variantClass = styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`] || "";

  // Classe dimensione (small, medium, large)
  const sizeClass = styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`];

  // Classe attiva comune
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

export default Button;
