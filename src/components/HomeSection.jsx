import React from 'react';
import styles from '../style/HomeSection.module.css';

export default function HomeSection({ id }) {
  return (
    <section id={id} className={styles.homeSection}>
      <img 
        src="src\assets\pizze.jpg"
        alt="pizze appetitose"
        className={styles.coverImage}
      />
      <button 
        className={styles.ctaButton}
        onClick={() => {
          const menuSection = document.getElementById('menu-section');
          if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Scopri il menù
      </button>
      <p className={styles.description}>
        Scopri La nostra deliziosa pizza in teglia, preparate con ingredienti freschi
      </p>  
    </section>
  );
}
