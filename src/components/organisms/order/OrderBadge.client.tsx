import { useEffect, useState } from "react";

import styles from "../../../style/OrderBadge.module.css";

interface OrderBadgeProps {
  onClick: () => void;
  totalItems: number;
}

export const OrderBadge = ({ onClick, totalItems }: OrderBadgeProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (totalItems > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  return (
    <button className={styles.orderBadgeButton} onClick={onClick}>
      <span>🛒 Il Mio Ordine</span>
      <span className={`${styles.badgeCounter} ${animate ? styles.animate : ""}`}>
        {totalItems}
      </span>
    </button>
  );
};
