import { useEffect, useState } from "react";

import styles from "../../../style/OrderBadge.module.css";

const PizzaSliceIcon = ({ animate }: { animate: boolean }) => (
  <svg
    className={`${styles.pizzaIcon} ${animate ? styles.pizzaWobble : ""}`}
    width="22"
    height="22"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Pizza slice shape */}
    <path
      d="M32 4 L58 56 Q45 62 32 62 Q19 62 6 56 Z"
      fill="#F4A623"
      stroke="#D4891A"
      strokeWidth="2"
    />
    {/* Crust */}
    <path
      d="M6 56 Q19 62 32 62 Q45 62 58 56"
      fill="#D4891A"
      stroke="#B8751A"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Cheese melted details */}
    <path
      d="M32 4 L58 56 Q45 62 32 62 Q19 62 6 56 Z"
      fill="url(#cheeseGradient)"
      opacity="0.3"
    />
    {/* Pepperoni */}
    <circle cx="28" cy="34" r="5" fill="#C0392B" opacity="0.9" />
    <circle cx="40" cy="44" r="4.5" fill="#C0392B" opacity="0.9" />
    <circle cx="22" cy="48" r="4" fill="#C0392B" opacity="0.9" />
    {/* Pepperoni highlights */}
    <circle cx="27" cy="32.5" r="1.5" fill="#E74C3C" opacity="0.5" />
    <circle cx="39" cy="42.5" r="1.5" fill="#E74C3C" opacity="0.5" />
    <circle cx="21" cy="46.5" r="1.2" fill="#E74C3C" opacity="0.5" />
    <defs>
      <linearGradient id="cheeseGradient" x1="32" y1="4" x2="32" y2="62">
        <stop offset="0%" stopColor="#FFF8DC" />
        <stop offset="100%" stopColor="#F4A623" />
      </linearGradient>
    </defs>
  </svg>
);

interface OrderBadgeProps {
  onClick: () => void;
  totalItems: number;
}

export const OrderBadge = ({ onClick, totalItems }: OrderBadgeProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (totalItems > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  return (
    <button className={styles.orderBadgeButton} onClick={onClick}>
      <PizzaSliceIcon animate={animate} />
      <span>Il Mio Ordine</span>
      <span className={`${styles.badgeCounter} ${animate ? styles.animate : ""}`}>
        {totalItems}
      </span>
    </button>
  );
};
