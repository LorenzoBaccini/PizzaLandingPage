import React, { useState, useMemo, useEffect } from 'react';
import styles from '../../style/MenuSection.module.css';
import { pizze } from '../../data/pizze.json';
import { calzoni } from '../../data/calzoni.json';
import { focacce_rotonde } from '../../data/focacce_rotonde.json';
import { insalatone_con_pane } from '../../data/insalatone_con_pane.json';
import { gastronomia_e_specialita_friggitoria } from '../../data/gastronomia_e_specialita_friggitoria.json';
import { doner_kebab } from '../../data/doner_kebab.json';
import { panini_e_piadine } from '../../data/panini_e_piadine.json';
import { dolci } from '../../data/dolci.json';
import { bevande } from '../../data/bevande.json';
import { offerte_menu } from '../../data/offerte_menu.json';
import { ingredienti } from "../../data/ingredienti.json";
import { allergeniIcons } from "../../config/allergeniIcons.js";
import allergeniData from "../../data/allergeni.json"; // per nomi tooltip
import Button from '../atoms/Button.jsx';
import { IngredientiModal } from './IngredientiModal.client.jsx';
import { PizzaSearch } from './PizzaSearch.client.jsx';
import { PizzaList } from './PizzaList.client.jsx';

export default function MenuSection({ id }) {
  const isBrowser = typeof window !== 'undefined';
  const section = [
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

  const [activeSection, setActiveSection] = useState(section[0]);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const [selectedFormats, setSelectedFormats] = useState({});
  const [tooltipId, setTooltipId] = useState(null);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);

  useEffect(() => {
    if (isIngredientModalOpen) {
      document.body.style.overflow = 'hidden'; // blocca scroll pagina
    } else {
      document.body.style.overflow = 'auto'; // abilita scroll pagina
    }
    return () => {
      document.body.style.overflow = 'auto'; // pulizia on unmount
    };
  }, [isIngredientModalOpen]);


  // Funzione per aprire modale scegliendo ingredienti
  const handleOpenIngredientModal = (product) => {
    const formato = hasMultipleFormats(product) ? getSelectedFormat(product) : null;
    const price = getPrice(product, formato);
    product = {
      ...product,
      formato: formato,
      prezzo: price,
      selectedExtras: selectedExtras
    };
    setSelectedProduct(product);
    setSelectedExtras([]); // reset selezione
    setIsIngredientModalOpen(true);
  };

  // Funzione checkbox per ingredienti
  const handleToggleExtra = (ingrediente, formato) => {
    if (selectedExtras.some(e => e.ingrediente === ingrediente)) {
      // Rimuovo se già selezionato
      setSelectedExtras(prev => prev.filter(e => e.ingrediente !== ingrediente));
    } else {
      const extra = ingredienti.find(i => i.ingrediente === ingrediente);

      if (extra) {

        // Formati che NON devono raddoppiare il prezzo
        const formatiNoMoltiplica = ["1/4 di Teglia", "1/2 Teglia", "Rotonda"];

        // Calcolo prezzo finale
        const prezzoFinale = formatiNoMoltiplica.includes(formato)
          ? extra.prezzo
          : extra.prezzo * 2;

        setSelectedExtras(prev => [
          ...prev,
          { ...extra, prezzo: prezzoFinale }
        ]);
      }
    }
  };

  useEffect(() => {
    setSearchInput('');
  }, [activeSection]);

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
  }, [activeSection, searchTerm, isBrowser]);

  const itemsRaw = contenuti[activeSection] || [];

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
    return `${activeSection.toLowerCase().replace(/\s+/g, '_')}_${item.nome.toLowerCase().replace(/\s+/g, '_')}`;
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

    if (selectedExtras.length > 0) {
      item = { ...item, selectedExtras: selectedExtras };
    }

    const formato = hasMultipleFormats(item) ? getSelectedFormat(item) : null;
    const productId = generateProductId(item, formato);
    const price = getPrice(item, formato);

    console.log('Aggiunta al carrello:', item);

    let productName = item.nome;
    if (formato) {
      productName = `${item.nome} (${formato})`;
    }

    const product = {
      id: productId,
      nome: productName,
      prezzo: price
    };

    if (isIngredientModalOpen) {
      setIsIngredientModalOpen(false);
      setSelectedProduct(null);
      setSelectedExtras([]);
    }

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
        {section.map((section) => (
          <Button
            key={section}
            role="tab"
            label={section}
            variant='primary'
            isActive={activeSection === section}
            aria-selected={activeSection === section}
            onClick={() => setActiveSection(section)}
          />
        ))}
      </div>

      {activeSection === "Pizze" && (
        <PizzaSearch
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        />
      )}

      <PizzaList
        itemsSelezionati={itemsSelezionati}
        quantities={quantities}
        allergeniData={allergeniData}
        allergeniIcons={allergeniIcons}
        tooltipId={tooltipId}
        handleAllergeneTouch={handleAllergeneTouch}
        getCurrentFormatQuantity={getCurrentFormatQuantity}
        hasMultipleFormats={hasMultipleFormats}
        getAvailableFormats={getAvailableFormats}
        getSelectedFormat={getSelectedFormat}
        setSelectedFormat={setSelectedFormat}
        handleDecreaseQuantity={handleDecreaseQuantity}
        handleIncreaseQuantity={handleIncreaseQuantity}
        handleOpenIngredientModal={handleOpenIngredientModal}
        handleAddToOrder={handleAddToOrder}
        generateProductBaseId={generateProductBaseId}
      />

      {isIngredientModalOpen &&
        <IngredientiModal
          open={isIngredientModalOpen}
          onClose={() => setIsIngredientModalOpen(false)}
          ingredienti={ingredienti}
          selectedProduct={selectedProduct}
          selectedExtras={selectedExtras}
          handleToggleExtra={handleToggleExtra}
          handleAddToOrder={handleAddToOrder}
        />
      }
    </section>
  );
}
