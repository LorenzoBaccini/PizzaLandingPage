import React from 'react';
import styles from '../style/HoursSection.module.css';

export default function HoursSection({ id }) {
  return (
    <section id={id} className={styles.hoursSection}>
      <h2 className={styles.title}>Orari</h2>
      <ul className={styles.hoursList}>
        <li>Lunedì - Venerdì: 11:30 - 23:00</li>
        <li>Sabato: 12:00 - 24:00</li>
        <li>Domenica: Chiuso</li>
      </ul>
    </section>
  );
}
