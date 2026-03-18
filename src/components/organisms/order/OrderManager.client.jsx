import { useState, useEffect } from 'react';
import OrderBadge from './OrderBadge.client.jsx';
import OrderPanel from './OrderPanel.client.jsx';

const STORAGE_KEY = 'pizzeria_mio_ordine';

export default function OrderManager() {
  const [items, setItems] = useState([]);
  const [note, setNote] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setItems(parsed.items || []);
        setNote(parsed.note || '');
      }
    } catch (e) {
      console.error('Error loading order:', e);
    }
  }, []);

  // Save to localStorage whenever items or note change
  useEffect(() => {
    const data = {
      items,
      note,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [items, note]);

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setItems(items.filter(item => item.id !== productId));
    } else {
      setItems(items.map(item => 
        item.id === productId ? { ...item, quantita: Math.min(newQuantity, 20) } : item
      ));
    }
  };

  const handleRemoveItem = (productId) => {
    setItems(items.filter(item => item.id !== productId));
  };

  const handleClearOrder = () => {
    setItems([]);
    setNote('');
  };

  const handleUpdateNote = (newNote) => {
    setNote(newNote);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantita, 0);

  // Expose functions to window for MenuSection integration
  useEffect(() => {
    window.orderManager = {
      addItem: (product, quantity = 1) => {
        setItems(currentItems => {
          const existing = currentItems.find(item => item.id === product.id);
          if (existing) {
            return currentItems.map(item =>
              item.id === product.id
                ? { ...item, quantita: Math.min(item.quantita + quantity, 20) }
                : item
            );
          } else {
            return [...currentItems, {
              id: product.id,
              nome: product.nome,
              prezzo: product.prezzo,
              quantita: quantity
            }];
          }
        });
      },
      getItemQuantity: (productId) => {
        const item = items.find(item => item.id === productId);
        return item ? item.quantita : 0;
      },
      updateQuantity: handleUpdateQuantity
    };
  }, [items]);

  return (
    <>
      <OrderBadge 
        onClick={() => setIsPanelOpen(true)} 
        totalItems={totalItems}
      />
      
      <OrderPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false) }
        items={items}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearOrder={handleClearOrder}
        note={note}
        onUpdateNote={handleUpdateNote}
      />
    </>
  );
}