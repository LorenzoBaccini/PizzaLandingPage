import { useState, useEffect, useRef } from 'react';
import styles from '../style/OrderPanel.module.css';

const CONFIG = {
  phoneNumber: '0362 197 2430',
  whatsappNumber: '393338007658',
  maxQuantityPerItem: 20,
  toastDuration: 3000
};

export default function OrderPanel({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onClearOrder, note, onUpdateNote }) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const wasOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      window.history.pushState({ mioOrdineOpen: true }, '');
      wasOpen.current = true;

      const onPopState = (e) => {
        if (wasOpen.current) {
          onClose();
        }
      };
      window.addEventListener('popstate', onPopState);

      return () => {
        window.removeEventListener('popstate', onPopState);
        wasOpen.current = false;
      };
    }
  }, [isOpen, onClose]);
  const handleShowConfirm = () => setShowConfirm(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const price = typeof item.prezzo === 'number' ? item.prezzo : parseFloat(item.prezzo) || 0;
      return total + (price * item.quantita);
    }, 0);
  };

  const formatOrderText = () => {
    let text = '🍕 IL MIO ORDINE\n\n';
    items.forEach(item => {
      const price = typeof item.prezzo === 'number' ? item.prezzo : parseFloat(item.prezzo) || 0;
      text += `${item.quantita}x ${item.nome} - €${(price * item.quantita).toFixed(2)}\n`;
    });
    text += `\nTotale: €${calculateTotal().toFixed(2)}`;
    if (note.trim()) {
      text += `\n\nNote: ${note}`;
    }
    return text;
  };

  const toast = (message, type = '') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), CONFIG.toastDuration);
  };

  const handleCallToOrder = () => {
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      window.location.href = `tel:${CONFIG.phoneNumber}`;
      toast('💡 Tieni aperta questa lista mentre ordini', 'success');
    } else {
      navigator.clipboard.writeText(CONFIG.phoneNumber).then(() => {
        toast(`📞 Numero copiato! ${CONFIG.phoneNumber}`, 'success');
      }).catch(() => {
        alert('Numero di telefono: ' + CONFIG.phoneNumber);
      });
    }
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(formatOrderText());
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  const handleCopyToClipboard = () => {
    const text = formatOrderText();

    // Prova moderna (funziona su HTTPS e gestori recenti)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          toast('📋 Lista copiata negli appunti!', 'success');
        })
        .catch(() => {
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        toast('📋 Lista copiata negli appunti!', 'success');
      } catch {
        toast('Copia non supportata su questo dispositivo', 'error');
      }
    }
  };

  const handleConfirmClear = () => {
    setShowConfirm(false);
    onClearOrder();
    toast('Lista svuotata');
  };

  // chiude solo la modale
  const handleCancel = () => setShowConfirm(false);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.orderOverlay} onClick={onClose}></div>

      <div className={`${styles.orderPanel} ${isOpen ? styles.active : ''}`}>
        <div className={styles.orderPanelHeader}>
          <h2>Il Mio Ordine ({items.reduce((sum, item) => sum + item.quantita, 0)})</h2>
          <button className={styles.btnClosePanel} onClick={onClose} aria-label="Chiudi pannello">
            ×
          </button>
        </div>

        <div className={styles.orderPanelContent}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📝</div>
              <p className={styles.emptyStateText}>
                La tua lista è vuota. Inizia ad aggiungere i tuoi prodotti preferiti!
              </p>
              <button className={styles.btnPrimary} onClick={onClose}>Vai al Menu</button>
            </div>
          ) : (
            <>
              <div className={styles.orderItemsList}>
                {items.map(item => {
                  const price = typeof item.prezzo === 'number' ? item.prezzo : parseFloat(item.prezzo) || 0;
                  return (
                    <div key={item.id} className={styles.orderItem}>
                      <div className={styles.orderItemInfo}>
                        <div className={styles.orderItemName}>{item.nome}</div>
                        <div className={styles.orderItemPrice}>€{price.toFixed(2)} cad.</div>
                      </div>
                      <div className={styles.orderItemControls}>
                        <div className={styles.orderItemSubtotal}>
                          €{(price * item.quantita).toFixed(2)}
                        </div>
                        <div className={styles.quantitySelector}>
                          <button onClick={() => onUpdateQuantity(item.id, item.quantita - 1)}>
                            −
                          </button>
                          <span className={styles.quantity}>{item.quantita}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantita + 1)}
                            disabled={item.quantita >= CONFIG.maxQuantityPerItem}
                          >
                            +
                          </button>
                        </div>
                        <button className={styles.btnRemoveItem} onClick={() => onRemoveItem(item.id)}>
                          Rimuovi
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.orderNotes}>
                <label htmlFor="orderNotes">Note aggiuntive (opzionale)</label>
                <textarea
                  id="orderNotes"
                  placeholder="Es: Senza cipolle, extra piccante..."
                  value={note}
                  onChange={(e) => onUpdateNote(e.target.value)}
                />
              </div>

              <div className={styles.orderTotal}>
                <div className={styles.orderTotalRow}>
                  <span>Totale:</span>
                  <span className={styles.orderTotalAmount}>€{calculateTotal().toFixed(2)}</span>
                  <div className={styles.orderDeliveryInfo}>
                    <span>Consegna (da aggiungere al totale):</span>
                    <br />
                    <span>A Desio: <span className={styles.orderDeliveryAmount}>€1,00</span></span>
                    <br />
                    <span>Fuori Desio: <span className={styles.orderDeliveryAmount}>€2,00</span></span>
                  </div>
                </div>
              </div>

              <div className={styles.orderActions}>
                <button className={styles.btnPrimary} onClick={handleCallToOrder}>
                  📞 Chiama per Ordinare
                </button>
                <button className={`${styles.btnSecondary} ${styles.btnWhatsapp}`} onClick={handleShareWhatsApp}>
                  💬 Condividi via WhatsApp
                </button>
                <button className={styles.btnSecondary} onClick={handleCopyToClipboard}>
                  📋 Copia Lista
                </button>
                <button className={styles.btnClear} onClick={handleShowConfirm}>
                  Svuota Lista
                </button>
                {showConfirm && (
                  <div className={styles.confirmModalOverlay} tabIndex={-1} role="dialog" aria-modal="true">
                    <div className={styles.confirmModal}>
                      <div className={styles.confirmModalContent}>
                        <h3>Sei sicuro di voler svuotare la lista?</h3>
                        <div className={styles.confirmModalActions}>
                          <button className={styles.btnSecondary} onClick={handleCancel}>Annulla</button>
                          <button className={styles.btnPrimary} onClick={handleConfirmClear}>Svuota</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showToast && (
        <div className={`${styles.toast} ${styles.show} ${toastType === 'success' ? styles.success : ''}`}>
          {toastMessage}
        </div>
      )}
    </>
  );
}