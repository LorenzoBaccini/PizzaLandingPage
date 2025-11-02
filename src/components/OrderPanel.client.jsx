import React, { useState, useEffect, useRef } from "react";
import styles from "../style/OrderPanel.module.css";

// Importa Ant Design Modal, Input, Button, Switch e TimePicker per UI
import { Modal, Input, Button, Switch, message as antdMessage } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

// Config example
const CONFIG = {
  phoneNumber: "0362 197 2430",
  whatsappNumber: "393338007658",
  maxQuantityPerItem: 20,
  toastDuration: 3000
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
  const [infoMessage, setInfoMessage] = useState("");

  // Gestisce la cronologia del browser per chiudere il pannello degli ordini all'indietro quando è aperto.
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

  const day = dayjs().day();
  const nowDate = dayjs().startOf('day');
  const now = dayjs()

  // Orari di apertura dal lunedì al sabato
  const openMorningStart = dayjs().hour(12).minute(0).second(0);
  const openMorningEnd = dayjs().hour(15).minute(0).second(0);
  const openEveningStart = dayjs().hour(18).minute(0).second(0);
  const openEveningEnd = dayjs().hour(22).minute(0).second(0);

  // Orari di apertura della domenica
  const sundayOpenStart = dayjs().hour(18).minute(0).second(0);
  const sundayOpenEnd = dayjs().hour(22).minute(0).second(0);

  const slotsTimes = [];

  // Funzione per generare gli slot di tempo dati startHour e endHour (numeri interi)
  const generateSlots = (startHour, endHour) => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += 15) {
        slots.push(nowDate.hour(hour).minute(min).second(0));
      }
    }
    return slots;
  };

  // Genera slot in base al giorno: domenica solo sera, feriali mattina e sera
  if (day === 0) {
    slotsTimes.push(...generateSlots(sundayOpenStart.hour(), sundayOpenEnd.hour()));
  } else {
    slotsTimes.push(...generateSlots(openMorningStart.hour(), openMorningEnd.hour()));
    slotsTimes.push(...generateSlots(openEveningStart.hour(), openEveningEnd.hour()));
  }

  // Messaggi di chiusura o info in base allo stato
  useEffect(() => {
    if (day === 0 && now.isBefore(sundayOpenStart)) {
      setInfoMessage("La domenica mattina la pizzeria è chiusa. Orari disponibili dalle 18:00");
    } else if (now.isAfter(openEveningEnd) || now.isAfter(sundayOpenEnd)) {
      setInfoMessage("La pizzeria è chiusa o è troppo tardi per consegnare a domicilio. Gli ordini saranno disponibili dal giorno successivo");
    } else {
      setInfoMessage("");
    }
  }, [now, day]);

  // Funzione per verificare se uno slot orario deve essere disabilitato
  const isSlotDisabled = (slot) => {
    const minSelectableTime = nowDate.hour(9).minute(0).second(0); // 9:00 del giorno corrente

    // Disabilita slot prima delle 9:00 del giorno corrente
    if (now.isBefore(minSelectableTime)) return true;

    // Disabilita slot prima dell'ora attuale
    if (slot.isBefore(now)) return true;

    // Disabilita slot fuori orari di apertura
    if (day === 0) {
      // Domenica solo fascia sera
      if (slot.isBefore(sundayOpenStart) || slot.isAfter(sundayOpenEnd)) return true;
    } else {
      // Giorni feriali: mattina o sera
      const inMorningRange = slot.isBetween(openMorningStart, openMorningEnd, null, '[)');
      const inEveningRange = slot.isBetween(openEveningStart, openEveningEnd, null, '[)');

      if (!inMorningRange && !inEveningRange) return true;
    }

    // Se nessuna delle condizioni sopra è stata soddisfatta, lo slot è abilitato
    return false;
  }


  // Gestore della selezione dello slot orario
  const handleSelectTime = (slot) => {
    setTimeError("");
    setPreferredTime(slot);
  };

  // Funzione per calcolare il totale
  const calculateTotal = () =>
    items.reduce((total, item) => {
      const price = typeof item.prezzo === "number" ? item.prezzo : parseFloat(item.prezzo) || 0;
      return total + price * item.quantita;
    }, 0);

  // Funzione per formattare il testo dell'ordine
  const formatOrderText = () => {
    let text = '🍕 IL MIO ORDINE\n\n';
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

    // Controlla orario preferito: se errore o non selezionato blocca invio
    if (timeError || !preferredTime) {
      setTimeError("Seleziona un orario di ritiro/consegna valido prima di procedere");
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

          <div>
            <p>Puoi suggerire un orario preferito di ritiro o ricezione ordine:</p>

            <div className={styles.timeSlotsWrapper}>
              <div className={styles.timeSlotsContainer}>
                {slotsTimes.map((slot) => {
                  const disabled = isSlotDisabled(slot);
                  const isSelected = preferredTime && slot.isSame(preferredTime);

                  return (
                    <button
                      key={slot.format("HH:mm")}
                      onClick={() => handleSelectTime(slot)}
                      disabled={disabled}
                      className={`${styles.timeSlotButton} ${isSelected ? styles.selected : ""} ${disabled ? styles.disabled : ""}`}
                      aria-pressed={isSelected}
                      aria-disabled={disabled}
                    >
                      {slot.format("HH:mm")}
                    </button>
                  );
                })}
              </div>
            </div>

            {timeError && (
              <div className={styles.messageError}>
                {timeError}
              </div>
            )}
            {infoMessage && !timeError && (
              <div className={styles.messageInfo}>
                {infoMessage}
              </div>
            )}
          </div>

          <p style={{ fontStyle: "italic", fontSize: "small" }}>
            L'ordine si può definire accettato solo quando si riceve un messaggio
            di risposta su WhatsApp. <br/> Il prezzo finale, in base ad eventuali
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
