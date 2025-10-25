import { useEffect, useState } from 'react';
import styles from '../style/OrderBadge.module.css';

export default function OrderBadge({ onClick, totalItems }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (totalItems > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  return (
    <div className={styles.orderBadge} onClick={onClick}>
      <button className={styles.orderBadgeButton}>
        <span>🛒 Il Mio Ordine</span>
        <span className={`${styles.badgeCounter} ${animate ? styles.animate : ''}`}>
          {totalItems}
        </span>
      </button>
    </div>
  );
}