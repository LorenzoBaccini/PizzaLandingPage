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
import { bevande } from '../data/bevande.json';
import { offerte_menu } from '../data/offerte_menu.json';
import { allergeniIcons } from "../data/allergeniIcons.js";
import allergeniData from "../data/allergeni.json"; // per nomi tooltip


export default function MenuSection({ id }) {
  const isBrowser = typeof window !== 'undefined';
  const sezioni = [
    'Pizze',
    'Menu',
    'Calzoni',
    'Focacce Rotonde',
    'Insalatone',
    'Gastronomia',
    'Doner Kebab',
    'Panini e Piadine',
    'Dolci',
    'Bevande'
  ];

  const contenuti = {
    'Pizze': pizze,
    'Menu': offerte_menu,
    'Calzoni': calzoni,
    'Focacce Rotonde': focacce_rotonde,
    'Insalatone': insalatone_con_pane,
    'Gastronomia': gastronomia_e_specialita_friggitoria,
    'Doner Kebab': doner_kebab,
    'Panini e Piadine': panini_e_piadine,
    'Dolci': dolci,
    'Bevande': bevande,
  };

  const [sezioneAttiva, setSezioneAttiva] = useState(sezioni[0]);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const [selectedFormats, setSelectedFormats] = useState({}); // Formato selezionato per ogni prodotto
  const [tooltipId, setTooltipId] = useState(null);

  useEffect(() => {
    setSearchInput('');
  }, [sezioneAttiva]);

  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(searchInput.trim()), 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    if (!isBrowser) return;

    const interval = setInterval(() => {
      if (window.orderManager) {
        const newQuantities = {};
        itemsSelezionati.forEach(item => {
          const baseId = generateProductBaseId(item);
          // Somma tutte le quantità di tutti i formati
          const totalQty = getTotalQuantityAllFormats(item);
          newQuantities[baseId] = totalQty;
        });
        setQuantities(newQuantities);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [sezioneAttiva, searchTerm, isBrowser]);

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

  // Genera ID base (senza formato)
  const generateProductBaseId = (item) => {
    return `${sezioneAttiva.toLowerCase().replace(/\s+/g, '_')}_${item.nome.toLowerCase().replace(/\s+/g, '_')}`;
  };

  // Genera ID completo (con formato se presente)
  const generateProductId = (item, formato = null) => {
    const baseId = generateProductBaseId(item);
    if (formato) {
      return `${baseId}_${formato.toLowerCase().replace(/\s+/g, '_')}`;
    }
    return baseId;
  };

  // Verifica se un prodotto ha formati multipli
  const hasMultipleFormats = (item) => {
    return item.prezzi && typeof item.prezzi === 'object' && Object.keys(item.prezzi).length > 1;
  };

  // Ottiene i formati disponibili per un prodotto
  const getAvailableFormats = (item) => {
    if (!item.prezzi) return [];
    return Object.keys(item.prezzi);
  };

  // Ottiene il formato selezionato o il primo disponibile
  const getSelectedFormat = (item) => {
    const baseId = generateProductBaseId(item);
    if (selectedFormats[baseId]) {
      return selectedFormats[baseId];
    }
    const formats = getAvailableFormats(item);
    return formats.length > 0 ? formats[0] : null;
  };

  // Imposta il formato selezionato
  const setSelectedFormat = (item, formato) => {
    const baseId = generateProductBaseId(item);
    setSelectedFormats(prev => ({
      ...prev,
      [baseId]: formato
    }));
  };

  // Ottiene il prezzo in base al formato selezionato
  const getPrice = (item, formato = null) => {
    if (item.prezzo) return parseFloat(item.prezzo);
    if (item.prezzi) {
      if (formato && item.prezzi[formato]) {
        return parseFloat(item.prezzi[formato]);
      }
      const selectedFormat = getSelectedFormat(item);
      if (selectedFormat && item.prezzi[selectedFormat]) {
        return parseFloat(item.prezzi[selectedFormat]);
      }
      const firstPrice = Object.values(item.prezzi)[0];
      return parseFloat(firstPrice);
    }
    return 0;
  };

  // Ottiene la quantità totale di tutti i formati di un prodotto
  const getTotalQuantityAllFormats = (item) => {
    if (!window.orderManager) return 0;

    if (hasMultipleFormats(item)) {
      const formats = getAvailableFormats(item);
      return formats.reduce((total, formato) => {
        const id = generateProductId(item, formato);
        return total + window.orderManager.getItemQuantity(id);
      }, 0);
    } else {
      const id = generateProductId(item);
      return window.orderManager.getItemQuantity(id);
    }
  };

  // Ottiene la quantità per il formato correntemente selezionato
  const getCurrentFormatQuantity = (item) => {
    if (!isBrowser || !window.orderManager) return 0;

    if (hasMultipleFormats(item)) {
      const formato = getSelectedFormat(item);
      const id = generateProductId(item, formato);
      return window.orderManager.getItemQuantity(id);
    } else {
      const id = generateProductId(item);
      return window.orderManager.getItemQuantity(id);
    }
  };

  // Gestione aggiunta al carrello
  const handleAddToOrder = (item) => {
    if (!window.orderManager) {
      console.error('OrderManager not initialized');
      return;
    }

    const formato = hasMultipleFormats(item) ? getSelectedFormat(item) : null;
    const productId = generateProductId(item, formato);
    const price = getPrice(item, formato);

    let productName = item.nome;
    if (formato) {
      productName = `${item.nome} (${formato})`;
    }

    const product = {
      id: productId,
      nome: productName,
      prezzo: price
    };

    window.orderManager.addItem(product, 1);
  };

  // Gestione aumento quantità
  const handleIncreaseQuantity = (item) => {
    if (!window.orderManager) return;

    const formato = hasMultipleFormats(item) ? getSelectedFormat(item) : null;
    const id = generateProductId(item, formato);
    const currentQty = window.orderManager.getItemQuantity(id);

    // Se il prodotto non è ancora nel carrello, aggiungilo
    if (currentQty === 0) {
      const price = getPrice(item, formato);
      let productName = item.nome;
      if (formato) productName = `${item.nome} (${formato})`;

      const product = {
        id: id,
        nome: productName,
        prezzo: price
      };

      // aggiunge il prodotto per la prima volta
      window.orderManager.addItem(product, 1);
    } else {
      // altrimenti aggiorna semplicemente la quantità
      window.orderManager.updateQuantity(id, currentQty + 1);
    }
  };

  // Gestione diminuzione quantità
  const handleDecreaseQuantity = (item) => {
    if (!isBrowser || !window.orderManager) return;

    const formato = hasMultipleFormats(item) ? getSelectedFormat(item) : null;
    const id = generateProductId(item, formato);
    const currentQty = window.orderManager.getItemQuantity(id);
    if (currentQty > 0) {
      window.orderManager.updateQuantity(id, currentQty - 1);
    }
  };

  const handleAllergeneTouch = (pizzaName, allergeneId) => {
    const id = `${pizzaName}-${allergeneId}`;
    setTooltipId(tooltipId === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Se click fuori dal contenitore tooltip, chiudi tooltip
      if (!event.target.closest(`.${styles.allergeniContainer}`)) {
        setTooltipId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);


  return (
    <section className={styles.menuSection} id={id}>
      <h2 className={styles.title}>IL NOSTRO MENU</h2>

      <div className={styles.filterContainer}>
        {sezioni.map((sez) => (
          <button
            key={sez}
            className={`${styles.filterButton} ${sezioneAttiva === sez ? styles.activeFilter : ''}`}
            onClick={() => setSezioneAttiva(sez)}
            aria-selected={sezioneAttiva === sez}
            role="tab"
            type="button"
          >
            {sez}
          </button>
        ))}
      </div>

      {sezioneAttiva === "Pizze" && (
        <div className={styles.searchContainer}>
          <label htmlFor="searchPizze" className={styles.searchLabel}>
            Cerca pizze e ingredienti:
          </label>
          <div className={styles.searchWrapper}>
            <input
              id="searchPizze"
              type="text"
              placeholder="Cerca pizze e ingredienti"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              autoComplete="off"
              className={styles.searchInput}
            />
            {searchInput && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={() => setSearchInput("")}
                aria-label="Pulisci campo"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {itemsSelezionati.length > 0 ? (
        <ul className={styles.pizzaList}>
          {itemsSelezionati.map((item, index) => {
            const baseId = generateProductBaseId(item);
            const totalQuantity = quantities[baseId] || 0;
            const currentFormatQuantity = getCurrentFormatQuantity(item);
            const hasFormats = hasMultipleFormats(item);
            const formats = getAvailableFormats(item);
            const selectedFormat = getSelectedFormat(item);

            const formatRows = formats.reduce((rows, formato, index) => {
              if (index % 2 === 0) rows.push([formato]);
              else rows[rows.length - 1].push(formato);
              return rows;
            }, []);

            return (
              <li key={`${baseId}_${index}`} className={styles.pizzaCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.pizzaNome}>
                    {item.nome}
                    {item.quantita && ` - ${item.quantita}`}
                    {totalQuantity > 0 && (
                      <span className={styles.totalBadge}> ({totalQuantity})</span>
                    )}
                  </h3>
                  <div key={item.nome} className={styles.allergeniContainer}>
                    {item.allergeni?.map((allergeneId) => {
                      const allergeneInfo = allergeniData.allergeni.find(a => a.id === allergeneId);
                      const Icon = allergeniIcons[allergeneId];
                      const uniqueId = `${item.nome}-${allergeneId}`;

                      return (
                        Icon && (
                          <span
                            onClick={() => handleAllergeneTouch(item.nome, allergeneId)}
                            className={styles.allergeneIcon}
                            key={uniqueId}
                            title={allergeneInfo?.nome || "Allergene"}
                            style={{ position: 'relative' }}
                          >
                            <Icon />
                            {tooltipId === uniqueId && (
                              <span className={styles.tooltip}>
                                {allergeneInfo?.nome}
                              </span>
                            )}
                          </span>
                        )
                      );
                    })}
                  </div>
                </div>

                {item.ingredienti && (
                  <p className={styles.ingredienti}>{item.ingredienti}</p>
                )}

                <div className={styles.prezzoBottomRight}>
                  {hasFormats && formats.length > 0 && (
                    <div className={styles.formatSelector}>
                      <label className={styles.formatLabel}>Formato:</label>
                      <div className={styles.formatButtons}>

                        {formatRows.map((row, i) => (
                          <div className={styles.formatRow} key={i}>
                            {row.map(formato => (
                              <button
                                key={formato}
                                type="button"
                                className={`${styles.formatButton} ${selectedFormat === formato ? styles.formatButtonActive : ''}`}
                                onClick={() => setSelectedFormat(item, formato)}
                              >
                                {formato}
                                <span className={styles.formatPrice}>{item.prezzi[formato].toFixed(2)}</span>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!hasFormats && item.prezzo && (
                    <div>
                      <strong>Prezzo</strong> <em>{item.prezzo}€</em>
                    </div>
                  )}


                  <div className={styles.orderControls}>
                    <div className={styles.quantitySelector}>
                      <button
                        onClick={() => handleDecreaseQuantity(item)}
                        disabled={currentFormatQuantity === 0}
                        aria-label="Diminuisci quantità"
                        className={styles.quantityBtn}
                      >
                        −
                      </button>
                      <span className={styles.quantity}>{currentFormatQuantity}</span>
                      <button
                        onClick={() => handleIncreaseQuantity(item)}
                        disabled={currentFormatQuantity >= 20}
                        aria-label="Aumenta quantità"
                        className={styles.quantityBtn}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={styles.btnAddToOrder}
                      onClick={() => handleAddToOrder(item)}
                    >
                      Aggiungi
                      {hasFormats && selectedFormat && (
                        <span className={styles.btnFormatHint}>
                          {" "}
                          {selectedFormat.split(" ")[0]}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p style={{ textAlign: 'center', padding: '40px', color: '#5C3A21' }}>
          Contenuto in aggiornamento...
        </p>
      )}
    </section>
  );
}
