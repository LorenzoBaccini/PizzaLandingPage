import React, { useState, useEffect, useRef } from "react";
import styles from "../style/OrderPanel.module.css";

// Importa Ant Design Modal, Input, Button, Switch e TimePicker per UI
import { Modal, Input, Button, Switch, TimePicker, AutoComplete, message as antdMessage } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

// Config example
const CONFIG = {
  phoneNumber: "0362 197 2430",
  whatsappNumber: "393338007658",
  maxQuantityPerItem: 20,
  toastDuration: 3000,
  geoapifyApiKey: "70e308641cbf47e8bae82b5839aed7fa"
};

export default function OrderPanel({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
  note,
  onUpdateNote,
}) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const wasOpen = useRef(false);

  // Nuove state per la modale di condivisione e consegna
  const [modalVisible, setModalVisible] = useState(false);
  const [deliverySelected, setDeliverySelected] = useState(false);
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [civicNumber, setCivicNumber] = useState("");
  const [intercom, setIntercom] = useState("");
  const [preferredTime, setPreferredTime] = useState(null);
  const [timeError, setTimeError] = useState("");

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      window.history.pushState({ mioOrdineOpen: true }, "");
      wasOpen.current = true;
    }
    const onPopState = (e) => {
      if (wasOpen.current) onClose();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isOpen, onClose]);

  const isTimeAllowed = (time) => {
    if (!time) return { allowed: true };

    const now = dayjs();
    const selected = dayjs(time);

    if (selected.isBefore(now, "minute")) {
      return { allowed: false, reason: "past" };
    }

    const day = now.day();

    if (day === 0) {
      const sundayDeliveryStart = now.hour(18).minute(0).second(0);
      const sundayDeliveryEnd = now.hour(22).minute(0).second(0);
      const inSundayDelivery = selected.isBetween(sundayDeliveryStart, sundayDeliveryEnd, null, "[)");
      if (!inSundayDelivery) {
        return { allowed: false, reason: "closed" };
      }
      return { allowed: true };
    }

    const openMorningStart = now.hour(11).minute(0).second(0);
    const openMorningEnd = now.hour(15).minute(0).second(0);
    const openDeliveryStart = now.hour(18).minute(0).second(0);
    const openDeliveryEnd = now.hour(22).minute(0).second(0);

    const inMorningWindow = selected.isBetween(openMorningStart, openMorningEnd, null, "[)");
    const inDeliveryWindow = selected.isBetween(openDeliveryStart, openDeliveryEnd, null, "[)");

    if (!inMorningWindow && !inDeliveryWindow) {
      return { allowed: false, reason: "closed" };
    }

    return { allowed: true };
  };

  const handlePreferredTimeChange = (time) => {
    if (!time) {
      setPreferredTime(null);
      setTimeError("");
      return;
    }
    const { allowed, reason } = isTimeAllowed(time);
    if (!allowed) {
      setTimeError(
        reason === "past"
          ? "Orario non valido. Hai selezionato un orario già passato."
          : "Orario non disponibile. La pizzeria è chiusa in questo orario."
      );
      return;
    }
    setTimeError("");
    setPreferredTime(time);
  };

  // Funzione per calcolare il totale
  const calculateTotal = () =>
    items.reduce((total, item) => {
      const price = typeof item.prezzo === "number" ? item.prezzo : parseFloat(item.prezzo) || 0;
      return total + price * item.quantita;
    }, 0);

  // Funzione per formattare il testo dell'ordine
  const formatOrderText = () => {
    let text = "IL MIO ORDINE\n";
    items.forEach((item) => {
      const price = typeof item.prezzo === "number" ? item.prezzo : parseFloat(item.prezzo) || 0;
      text += `${item.quantita}x ${item.nome} - €${(price * item.quantita).toFixed(2)}\n`;
    });
    text += `Totale: €${calculateTotal().toFixed(2)}\n\n`;
    if (deliverySelected) {
      text += "Consegna a domicilio:\n";
      text += `Indirizzo: ${address}\n`;
      text += `Civico: ${civicNumber}\n`;
      text += `Citofono: ${intercom}\n`;
    } else {
      text += "Ritiro in loco\n";
    }
    text += preferredTime
      ? `Orario preferito ritiro/ricezione: ${preferredTime.format("HH:mm")}\n`
      : "";
    text += note.trim() ? `Note: ${note.trim()}\n` : "";
    text +=
      "\nL'ordine si intende accettato solo con messaggio di risposta via WhatsApp.\n";
    text += "**Il prezzo definitivo, inclusi eventuali extra, verrà confermato via WhatsApp.**\n";
    return text;
  };

  // Funzione per mostrare toast (come messaggio esterno)
  const toast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), CONFIG.toastDuration);
  };

  // Funzione chiamata all'apertura della modale condivisione WhatsApp
  const handleShareWhatsAppClick = () => {
    setModalVisible(true);
  };

  // Gestione conferma convalidata
  const handleConfirmShare = () => {
    if (deliverySelected && address.trim() === "") {
      setAddressError("Inserisci l'indirizzo di consegna");
      return;
    }
    setAddressError("");
    const message = encodeURIComponent(formatOrderText());
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`;
    window.open(url, "_blank");
    setModalVisible(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.orderOverlay} onClick={onClose}>
      <div
        className={`${styles.orderPanel} ${isOpen ? styles.active : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.orderPanelHeader}>
          <h2>Il Mio Ordine ({items.reduce((sum, item) => sum + item.quantita, 0)})</h2>
          <button
            className={styles.btnClosePanel}
            onClick={onClose}
            aria-label="Chiudi pannello"
          >
            ×
          </button>
        </div>

        <div className={styles.orderPanelContent}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon} />
              <p className={styles.emptyStateText}>
                La tua lista è vuota. Inizia ad aggiungere i tuoi prodotti
                preferiti!
              </p>
              <button className={styles.btnPrimary} onClick={onClose}>
                Vai al Menù
              </button>
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
                <label htmlFor="orderNotes">
                  Note aggiuntive (opzionale) <br />
                  - ingredienti aggiunti da <span className={styles.orderDeliveryAmount}>1.00€</span> a <span className={styles.orderDeliveryAmount}>3.00€</span> <br />
                  - impasto integrale <span className={styles.orderDeliveryAmount}>1.00€</span> <br />
                  - mozzarella senza lattosio <span className={styles.orderDeliveryAmount}>1.50€</span>
                </label>
                <textarea
                  id="orderNotes"
                  placeholder="Es. Senza cipolle, extra piccante..."
                  value={note}
                  onChange={(e) => onUpdateNote(e.target.value)}
                />
              </div>

              <div className={styles.orderTotal}>
                <div className={styles.orderTotalRow}>
                  <span>Totale</span>
                  <span className={styles.orderTotalAmount}>€{calculateTotal().toFixed(2)}</span>
                </div>
                <div className={styles.orderDeliveryInfo}>
                  <span className={styles.orderDeliveryAmount}>ATTENZIONE</span>
                  <br />
                  <span>Al totale bisogna aggiungere il costo di consegna (se a domicilio) ed eventuali aggiunte all'ordine</span>
                  <br />
                  <span>Consegna a Desio <span className={styles.orderDeliveryAmount}>1,00€</span></span>
                  <br />
                  <span>Fuori Desio <span className={styles.orderDeliveryAmount}>2,00€</span></span>
                </div>
              </div>

              <div className={styles.orderActions}>
                <button
                  className={styles.btnPrimary}
                  onClick={() => {
                    window.location.href = `tel:${CONFIG.phoneNumber}`;
                    toast(
                      "Tieni aperta questa lista mentre ordini",
                      "success"
                    );
                  }}
                >
                  Chiama per Ordinare
                </button>

                {/* Pulsante Condividi via WhatsApp con apertura modale */}
                <button
                  className={`${styles.btnSecondary} ${styles.btnWhatsapp}`}
                  onClick={handleShareWhatsAppClick}
                >
                  💬 Condividi via WhatsApp
                </button>

                <button
                  className={styles.btnSecondary}
                  onClick={() => {
                    navigator.clipboard
                      .writeText(formatOrderText())
                      .then(() => toast("Lista copiata negli appunti!", "success"))
                      .catch(() => toast("Copia non supportata", "error"));
                  }}
                >
                  Copia Lista
                </button>

                <button className={styles.btnClear} onClick={() => setShowConfirm(true)}>
                  Svuota Lista
                </button>
              </div>
            </>
          )}
        </div>

        {/* Modale conferma svuota lista */}
        {showConfirm && (
          <div className={styles.confirmModalOverlay} tabIndex={-1} role="dialog" aria-modal="true">
            <div className={styles.confirmModal}>
              <div className={styles.confirmModalContent}>
                <h3>Sei sicuro di voler svuotare la lista?</h3>
                <div className={styles.confirmModalActions}>
                  <button
                    className={styles.btnSecondary}
                    onClick={() => setShowConfirm(false)}
                  >
                    Annulla
                  </button>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => {
                      onClearOrder();
                      setShowConfirm(false);
                      toast("Lista svuotata", "success");
                    }}
                  >
                    Svuota
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale Condivisione WhatsApp con gestione consegna */}
        <Modal
          zIndex={5000}
          title="Condividi via WhatsApp"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setModalVisible(false)}>
              Annulla
            </Button>,
            <Button key="submit" type="primary" onClick={handleConfirmShare}>
              Invia su WhatsApp
            </Button>,
          ]}
        >
          <p>
            Vuoi la consegna a domicilio?{" "}
            <Switch
              checked={deliverySelected}
              onChange={(checked) => {
                setDeliverySelected(checked);
                if (!checked) setAddressError("");
              }}
              style={{ marginLeft: 8 }}
            />
          </p>

          {deliverySelected && (
            <>
              <Input
                placeholder="Inserisci l'indirizzo di consegna"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (e.target.value.trim() !== "") setAddressError("");
                }}
                style={{ marginBottom: 5 }}
              />
              {addressError && (
                <div style={{ color: "red", marginBottom: 10, fontSize: "0.85rem" }}>
                  {addressError}
                </div>
              )}
              <Input
                placeholder="Civico"
                value={civicNumber}
                onChange={(e) => setCivicNumber(e.target.value)}
                style={{ marginBottom: 10 }}
              />
              <Input
                placeholder="Citofono"
                value={intercom}
                onChange={(e) => setIntercom(e.target.value)}
                style={{ marginBottom: 10 }}
              />
            </>
          )}

          <p>Puoi suggerire un orario preferito di ritiro o ricezione ordine:</p>
          <TimePicker
            value={preferredTime}
            onChange={handlePreferredTimeChange}
            format="HH:mm"
            style={{ marginBottom: 10, width: "100%", popup: { root: { zIndex: 5050 } } }}
            placeholder="Seleziona orario preferito"
            status={timeError ? "error" : ""}
          />
          {timeError && (
            <div style={{ color: "red", fontSize: "0.85rem", marginTop: -8, marginBottom: 10 }}>
              {timeError}
            </div>
          )}

          <p style={{ fontStyle: "italic", fontSize: "small" }}>
            L'ordine si può definire accettato solo quando si riceve un messaggio
            di risposta su WhatsApp. Il prezzo finale, in base ad eventuali
            modifiche o aggiunte, verrà confermato tramite WhatsApp.
          </p>
        </Modal>

        {/* Toast messaggio */}
        {showToast && (
          <div
            className={`${styles.toast} ${toastType === "success" ? styles.success : styles.error
              }`}
          >
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
