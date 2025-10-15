import React from 'react';
import styles from '../style/AboutSection.module.css';

export default function AboutSection({ id }) {
  return (
    <section id={id} className={styles.aboutSection}>
      <h2 className={styles.title}>Chi Siamo</h2>
      <div className={styles.rusticBackground}>
        <p className={styles.content}>
          La Teglia è una pizzeria kebab dedicata a offrire sapori autentici e un’esperienza accogliente. Utilizziamo solo ingredienti freschi e selezionati, seguendo una filosofia di qualità e passione.
        </p>
        <p className={styles.content}>
          Il nostro staff è composto da professionisti esperti e appassionati, pronti a farvi sentire come a casa.
        </p>
        <div className={styles.staffPhotos}>
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Staff1" className={styles.staffPhoto} />
          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Staff2" className={styles.staffPhoto} />
          <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="Staff3" className={styles.staffPhoto} />
        </div>
      </div>
    </section>
  );
}
