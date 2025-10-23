import React, { useState, useMemo, useEffect } from 'react';
import styles from '../style/MenuSection.module.css';
import { pizze } from '../data/pizze.json';
import { calzoni } from '../data/calzoni.json';
import { focacce_rotonde } from '../data/focacce_rotonde.json';
import { insalatone_con_pane } from '../data/insalatone_con_pane.json';
import { gastronomia_e_specialita_friggitoria } from '../data/gastronomia_e_specialita_friggitoria.json';
import { doner_kebab } from '../data/doner_kebab.json';
import { panini_e_piadine } from '../data/panini_e_piadine.json';
import { dolci } from '../data/dolci.json';
import { bevande_e_aggiunte } from '../data/bevande_e_aggiunte.json';

export default function MenuSection({ id }) {
  const sezioni = [
    'Pizze',
    'Calzoni',
    'Focacce Rotonde',
    'Insalatone',
    'Gastronomia',
    'Doner Kebab',
    'Panini e Piadine',
    'Dolci',
    'Bevande e Aggiunte'
  ];

  const contenuti = {
    'Pizze': pizze,
    'Calzoni': calzoni,
    'Focacce Rotonde': focacce_rotonde,
    'Insalatone': insalatone_con_pane,
    'Gastronomia': gastronomia_e_specialita_friggitoria,
    'Doner Kebab': doner_kebab,
    'Panini e Piadine': panini_e_piadine,
    'Dolci': dolci,
    'Bevande e Aggiunte': bevande_e_aggiunte,
  };

  const [sezioneAttiva, setSezioneAttiva] = useState(sezioni[0]);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(searchInput.trim()), 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const itemsRaw = contenuti[sezioneAttiva] || [];

  const itemsSelezionati = useMemo(() => {
    if (!searchTerm) return itemsRaw;
    const lowerSearch = searchTerm.toLowerCase();
    return itemsRaw.filter(
      (item) =>
        item.nome.toLowerCase().includes(lowerSearch) ||
        (item.ingredienti && item.ingredienti.toLowerCase().includes(lowerSearch))
    );
  }, [itemsRaw, searchTerm]);

  return (
    <section id={id} className={styles.menuSection} aria-label="Menù completo">
      <h2 className={styles.title}>IL NOSTRO MENU</h2>

      <nav
        className={styles.filterContainer}
        role="tablist"
        aria-label="Sezioni del menù"
      >
        {sezioni.map((sez) => (
          <button
            key={sez}
            id={`tab-${sez}`}
            className={`${styles.filterButton} ${sezioneAttiva === sez ? styles.activeFilter : ''
              }`}
            onClick={() => setSezioneAttiva(sez)}
            aria-selected={sezioneAttiva === sez}
            role="tab"
            type="button"
          >
            {sez}
          </button>
        ))}
      </nav>

      {sezioneAttiva === "Pizze" && (
        <div className={styles.searchContainer}>
          <label htmlFor="searchInput" className={styles.searchLabel}>
            Cerca pizze e ingredienti:
          </label>
          <input
            id="searchInput"
            type="text"
            className={styles.searchInput}
            placeholder="Scrivi per cercare una pizza..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-describedby="searchHelp"
            autoComplete="off"
          />
        </div>)}

      <ul
        className={styles.pizzaList}
        role="tabpanel"
        aria-labelledby={`tab-${sezioneAttiva}`}
        key={sezioneAttiva}
      >
        {itemsSelezionati.length > 0 ? (
          itemsSelezionati.map(({ nome, ingredienti, prezzi, prezzo }) => (
            <li key={nome} className={styles.pizzaCard}>
              <h4 className={styles.pizzaNome}>{nome}</h4>
              {ingredienti && <p className={styles.ingredienti}>{ingredienti}</p>}
              {prezzi ? (
                <div className={styles.prezzoBottomRight} aria-label={`Prezzi - ${nome}`}>
                  {Object.entries(prezzi).map(([chiave, valore]) => (
                    <div key={chiave}>
                      <strong>{chiave}</strong>: <em>{valore}€</em>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.prezzoBottomRight} aria-label={`Prezzo - ${nome}`}>
                  <strong>Prezzo</strong> <em>{prezzo ?? 'n.d.'}€</em>
                </div>
              )}
            </li>
          ))
        ) : (
          <p className={styles.noContent}>Contenuto in aggiornamento...</p>
        )}
      </ul>
    </section>
  );
}
