import React from 'react';
import styles from '../style/HoursSection.module.css';

export default function HoursSection({ id }) {
  return (
    <section id={id} className={styles.hoursSection}>
      <h2 className={styles.title}>Orari</h2>
      <ul className={styles.hoursList}>
        <li>Sempre aperti</li>
        <li>Tutti i giorni anche i festivi</li>
        <li>11:00 alle 15:00</li>
        <li>17:30 alle 00:00</li>
        <li>Chiuso Domenica mattina</li>
      </ul>
    </section>
  );
}
