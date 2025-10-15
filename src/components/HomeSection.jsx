import React from 'react';
import styles from '../style/HomeSection.module.css';

export default function HomeSection({ id }) {
  return (
    <section id={id} className={styles.homeSection}>
      <img 
        src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80"
        alt="Kebab appetitoso"
        className={styles.coverImage}
      />
      <h1 className={styles.title}>Benvenuti a La Teglia</h1>
      <p className={styles.description}>
        Scopri il sapore autentico dei nostri kebab, preparati con ingredienti freschi e tanta passione.
      </p>
      <button 
        className={styles.ctaButton}
        onClick={() => {
          const menuSection = document.getElementById('menu-section');
          if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Scopri il menù
      </button>
    </section>
  );
}
