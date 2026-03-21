import { useState } from "react";

import styles from "../../style/header.module.css";

const menuItems = [
  { label: "Home", targetId: "home-section" },
  { label: "Menù", targetId: "menu-section" },
  { label: "Orari", targetId: "hours-section" },
  { label: "Contatti", targetId: "contact-section" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>LA TEGLIA</div>

      <nav className={styles.desktopNav}>
        {menuItems.map(({ label, targetId }) => (
          <button
            key={label}
            className={styles.desktopNavLink}
            onClick={() => handleScroll(targetId)}
          >
            {label}
          </button>
        ))}
      </nav>

      <button
        className={`${styles.hamburgerButton} ${open ? styles.active : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </button>

      <nav className={`${styles.menuNav} ${open ? styles.open : ""}`}>
        <ul className={styles.menuList}>
          {menuItems.map(({ label, targetId }) => (
            <li key={label} className={styles.menuItem}>
              <button
                className={styles.menuItemButton}
                onClick={() => handleScroll(targetId)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};
