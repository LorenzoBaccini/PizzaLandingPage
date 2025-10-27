import React, { useState } from 'react';
import styles from '../style/header.module.css';

const menuItems = [
  { label: 'Home', targetId: 'home-section' },
  { label: 'Offerte', targetId: 'offerte' },
  { label: 'Menù', targetId: 'menu-section' },
  { label: 'Orari', targetId: 'hours-section' },
  { label: 'Contatti', targetId: 'contact-section' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setOpen(false);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>{['L', 'A'].map((char, i) => (
        <span
          key={'LA-' + i}
          style={{
            color: ['#EE5A00', '#B43104'][i], // arancione e rosso mattone
            display: 'inline-block',
            transition: 'color 0.3s ease',
          }}
        >
          {char}
        </span>
      ))}
        <span> </span>
        {'TEGLIA'.split('').map((char, i) => (
          <span
            key={'TEGLIA-' + i}
            style={{
              color: ['#facd17ff', '#5b7a1bff', '#B43104', '#d6ae0cff', '#34912A', '#EE5A00'][i], // giallo, verde basilico, rosso, giallo, verde, arancio
              display: 'inline-block',
              transition: 'color 0.3s ease',
            }}
          >
            {char}
          </span>
        ))}</div>

      <button
        className={`${styles.hamburgerButton} ${open ? styles.active : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </button>

      <nav className={`${styles.menuNav} ${open ? styles.open : ''}`}>
        <ul className={styles.menuList}>
          {menuItems.map(({ label, targetId }) => (
            <li
              key={label}
              className={styles.menuItem}
              onClick={() => handleScroll(targetId)}
            >
              {label}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
