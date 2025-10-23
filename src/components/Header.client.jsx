import React, { useState, useEffect, useRef } from 'react';
import styles from '../style/header.module.css';

const menuItems = [
  { label: 'Home', targetId: 'home-section' },
  { label: 'Menù', targetId: 'menu-section' },
  { label: 'Orari', targetId: 'hours-section' },
  { label: 'Contatti', targetId: 'contact-section' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>LA TEGLIA</div>
      <button
        ref={buttonRef}
        aria-label="Toggle menu"
        onClick={() => setOpen(!open)}
        className={styles.hamburgerButton}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#B04030" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect y="4" width="24" height="3" />
          <rect y="10" width="24" height="3" />
          <rect y="16" width="24" height="3" />
        </svg>
      </button>
      {open && (
        <nav ref={menuRef} className={styles.menuNav}>
          <ul className={styles.menuList}>
            {menuItems.map(({ label, targetId }) => (
              <li
                key={label}
                className={styles.menuItem}
                onClick={() => {
                  const el = document.getElementById(targetId);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  setOpen(false);
                }}
              >
                {label}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
