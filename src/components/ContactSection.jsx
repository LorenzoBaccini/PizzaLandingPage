import React from 'react';
import styles from '../style/ContactSection.module.css';

export default function ContactSection({ id }) {
  return (
    <section id={id} className={styles.contactSection}>
      <h2 className={styles.title}>Contatti</h2>
      <div className={styles.contactInfo}>
        <div className={styles.phone}>
          Numero di telefono: <br /><a href="tel:0362 197 2430" style={{ color: '#B04030', textDecoration: 'none' }}>0362 197 2430</a>
        </div>
        <div className={styles.address}>
          Indirizzo: <br /> Via Monterosa 132, Desio (MB)
        </div>
      </div>
      <div className={styles.mapContainer}>
        <iframe
          title="Mappa La Teglia"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2790.5807345505305!2d9.19151667914968!3d45.6190688363988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786bc2e13d7d0fd%3A0x97d1f73a87c27be4!2sLa%20Teglia!5e0!3m2!1sit!2sit!4v1760802077903!5m2!1sit!2sit"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </section>
  );
}
