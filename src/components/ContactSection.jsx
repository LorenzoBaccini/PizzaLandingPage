import React, { useState } from 'react';
import styles from '../style/ContactSection.module.css';

export default function ContactSection({ id }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('Per favore compila tutti i campi obbligatori.');
      return;
    }
    // Simula invio form
    setStatus('Invio in corso...');
    setTimeout(() => {
      setStatus('Messaggio inviato con successo! Grazie.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 1500);
  };

  return (
    <section id={id} className={styles.contactSection}>
      <h2 className={styles.title}>Contatti</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="name">Nome *</label>
          <input type="text" id="name" name="name" className={styles.input} required value={formData.name} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">Email *</label>
          <input type="email" id="email" name="email" className={styles.input} required value={formData.email} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="phone">Numero di telefono</label>
          <input type="tel" id="phone" name="phone" className={styles.input} placeholder="+39 123 456 7890" value={formData.phone} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="message">Messaggio *</label>
          <textarea id="message" name="message" className={styles.textarea} required value={formData.message} onChange={handleChange} />
        </div>
        <button type="submit" className={styles.submitButton}>Invia</button>
      </form>
      {status && <p style={{marginTop: '15px', color: '#D2691E', fontWeight: '700'}}>{status}</p>}

      <div className={styles.contactInfo}>
        <div className={styles.phone}>
          Numero di telefono: <a href="tel:+391234567890">+39 123 456 7890</a>
        </div>
        <div className={styles.address}>
          Indirizzo: Via Roma 10, Milano
        </div>
        <div className={styles.socialIcons}>
          <a href="#" aria-label="Facebook" title="Facebook" target="_blank" rel="noopener noreferrer">📘</a>
          <a href="#" aria-label="Instagram" title="Instagram" target="_blank" rel="noopener noreferrer">📸</a>
          <a href="#" aria-label="Twitter" title="Twitter" target="_blank" rel="noopener noreferrer">🐦</a>
        </div>
      </div>
    </section>
  );
}
