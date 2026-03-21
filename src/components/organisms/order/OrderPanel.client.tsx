import { useState, useEffect, useRef } from "react";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

import { Modal, Input, Switch, Select } from "../../atoms";
import { Button } from "../../atoms/Button";
import styles from "../../../style/OrderPanel.module.css";
import { ORDER_SLOTS } from "../../../config/businessHours";

import type { OrderItem } from "../../../types";

dayjs.extend(isBetween);

const COMUNI_CONSEGNA = [
  { nome: "Desio", sovrapprezzo: 1 },
  { nome: "Seregno", sovrapprezzo: 2 },
  { nome: "Lissone", sovrapprezzo: 2 },
  { nome: "Cesano Maderno", sovrapprezzo: 2 },
  { nome: "Muggiò", sovrapprezzo: 2 },
  { nome: "Nova Milanese", sovrapprezzo: 2 },
  { nome: "Bovisio-Masciago", sovrapprezzo: 2 },
  { nome: "Varedo", sovrapprezzo: 2 },
  { nome: "Meda", sovrapprezzo: 2 },
];

const CONFIG = {
  phoneNumber: "0362 197 2430",
  whatsappNumber: "393338007658",
  maxQuantityPerItem: 20,
  toastDuration: 3000,
};

interface OrderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearOrder: () => void;
  onEditItem?: (item: OrderItem) => void;
}

export const OrderPanel = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
  onEditItem,
}: OrderPanelProps) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const wasOpen = useRef(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [deliverySelected, setDeliverySelected] = useState(false);
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [civicNumber, setCivicNumber] = useState("");
  const [civicError, setCivicError] = useState("");
  const [intercom, setIntercom] = useState("");
  const [intercomError, setIntercomError] = useState("");
  const [comune, setComune] = useState<string | null>(null);
  const [comuneError, setComuneError] = useState("");
  const [preferredTime, setPreferredTime] = useState<dayjs.Dayjs | null>(null);
  const [timeError, setTimeError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      window.history.pushState({ mioOrdineOpen: true }, "");
      wasOpen.current = true;
    }
    const onPopState = () => {
      if (wasOpen.current) onClose();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isOpen, onClose]);

  const day = dayjs().day();
  const nowDate = dayjs().startOf("day");
  const now = dayjs();

  const openMorningStart = dayjs().hour(ORDER_SLOTS.weekday.morning.start).minute(0).second(0);
  const openMorningEnd = dayjs().hour(ORDER_SLOTS.weekday.morning.end).minute(0).second(0);
  const openEveningStart = dayjs().hour(ORDER_SLOTS.weekday.evening.start).minute(0).second(0);
  const openEveningEnd = dayjs().hour(ORDER_SLOTS.weekday.evening.end).minute(0).second(0);

  const sundayOpenStart = dayjs().hour(ORDER_SLOTS.sunday.evening.start).minute(0).second(0);
  const sundayOpenEnd = dayjs().hour(ORDER_SLOTS.sunday.evening.end).minute(0).second(0);

  const slotsTimes: dayjs.Dayjs[] = [];

  const generateSlots = (startHour: number, endHour: number) => {
    const slots: dayjs.Dayjs[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += 15) {
        slots.push(nowDate.hour(hour).minute(min).second(0));
      }
    }
    return slots;
  };

  if (day === 0) {
    slotsTimes.push(...generateSlots(sundayOpenStart.hour(), sundayOpenEnd.hour()));
  } else {
    slotsTimes.push(...generateSlots(openMorningStart.hour(), openMorningEnd.hour()));
    slotsTimes.push(...generateSlots(openEveningStart.hour(), openEveningEnd.hour()));
  }

  useEffect(() => {
    const minSelectableTime = nowDate.hour(9).minute(0).second(0);
    if (day === 0 && now.isBefore(sundayOpenStart)) {
      setInfoMessage(
        "La domenica mattina la pizzeria è chiusa. Orari disponibili dalle 18:00"
      );
    } else if (now.isAfter(openEveningEnd) || now.isAfter(sundayOpenEnd)) {
      setInfoMessage(
        "La pizzeria è chiusa o è troppo tardi per consegnare a domicilio. Gli ordini saranno disponibili dal giorno successivo"
      );
    } else if (now.isBefore(minSelectableTime)) {
      setInfoMessage("Attendi le 9.00 per poter effettuare un ordine");
    } else {
      setInfoMessage("");
    }
  }, [now, day]);

  const isSlotDisabled = (slot: dayjs.Dayjs) => {
    const minSelectableTime = nowDate.hour(9).minute(0).second(0);
    if (now.isBefore(minSelectableTime)) return true;
    if (slot.isBefore(now)) return true;

    if (day === 0) {
      if (slot.isBefore(sundayOpenStart) || slot.isAfter(sundayOpenEnd)) return true;
    } else {
      const inMorningRange = slot.isBetween(openMorningStart, openMorningEnd, null, "[)");
      const inEveningRange = slot.isBetween(openEveningStart, openEveningEnd, null, "[)");
      if (!inMorningRange && !inEveningRange) return true;
    }

    return false;
  };

  const handleSelectTime = (slot: dayjs.Dayjs) => {
    setTimeError("");
    setPreferredTime(slot);
  };

  const calculateTotal = () =>
    items.reduce((total, item) => {
      const price = typeof item.prezzo === "number" ? item.prezzo : parseFloat(String(item.prezzo)) || 0;
      return total + price * item.quantita;
    }, 0);

  const formatCustomizationText = (item: OrderItem): string => {
    if (!item.customization) return "";
    const parts: string[] = [];
    if (item.customization.menuScelta) {
      parts.push(`  Panino: ${item.customization.menuScelta}`);
    }
    if (item.customization.menuBevanda) {
      parts.push(`  Bevanda: ${item.customization.menuBevanda}`);
    }
    if (item.customization.variante) {
      parts.push(`  Formato: ${item.customization.variante}`);
    }
    if (item.customization.extras.length > 0) {
      parts.push(`  + ${item.customization.extras.map((e) => e.ingrediente).join(", ")}`);
    }
    if (item.customization.removedIngredients.length > 0) {
      parts.push(`  - Senza: ${item.customization.removedIngredients.join(", ")}`);
    }
    if (item.customization.opzioniSpeciali?.length > 0) {
      parts.push(`  Opzioni: ${item.customization.opzioniSpeciali.join(", ")}`);
    }
    return parts.length > 0 ? "\n" + parts.join("\n") : "";
  };

  const formatOrderText = () => {
    const subtotal = calculateTotal();
    const comuneData = deliverySelected ? COMUNI_CONSEGNA.find((c) => c.nome === comune) : null;
    const deliverySurcharge = comuneData?.sovrapprezzo ?? 0;
    const grandTotal = subtotal + deliverySurcharge;

    let text = "🍕 *ORDINE LA TEGLIA*\n";
    text += "━━━━━━━━━━━━━━━━━━━━\n\n";

    items.forEach((item) => {
      const price = typeof item.prezzo === "number" ? item.prezzo : parseFloat(String(item.prezzo)) || 0;
      const lineTotal = price * item.quantita;
      text += `▸ *${item.quantita}x ${item.nome}*`;
      if (item.quantita > 1) {
        text += ` (€${price.toFixed(2)} cad.)`;
      }
      text += ` — €${lineTotal.toFixed(2)}`;
      text += formatCustomizationText(item);
      text += "\n";
    });

    text += "\n━━━━━━━━━━━━━━━━━━━━\n";
    text += `Subtotale prodotti: €${subtotal.toFixed(2)}\n`;

    if (deliverySelected && deliverySurcharge > 0) {
      text += `Consegna (${comune}): €${deliverySurcharge.toFixed(2)}\n`;
    }

    text += `\n💰 *TOTALE: €${grandTotal.toFixed(2)}*\n`;
    text += "━━━━━━━━━━━━━━━━━━━━\n\n";

    if (deliverySelected) {
      text += "📍 *Consegna a domicilio*\n";
      text += `${address}, ${civicNumber} — ${comune}\n`;
      text += `Citofono: ${intercom}\n`;
    } else {
      text += "🏪 *Ritiro in negozio*\n";
    }

    if (preferredTime) {
      text += `⏰ Orario preferito: ${preferredTime.format("HH:mm")}\n`;
    }

    text += "\n_L'ordine è confermato solo dopo risposta su WhatsApp._\n";
    text += "_Il prezzo finale potrebbe variare in base a modifiche o aggiunte._\n";
    return text;
  };

  const toast = (message: string, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), CONFIG.toastDuration);
  };

  const handleShareWhatsAppClick = () => {
    setModalVisible(true);
  };

  const handleConfirmShare = () => {
    let hasError = false;

    if (deliverySelected) {
      if (address.trim() === "") {
        setAddressError("Inserisci l'indirizzo di consegna");
        hasError = true;
      } else {
        setAddressError("");
      }
      if (civicNumber.trim() === "") {
        setCivicError("Inserisci il numero civico");
        hasError = true;
      } else {
        setCivicError("");
      }
      if (intercom.trim() === "") {
        setIntercomError("Inserisci il nome sul citofono");
        hasError = true;
      } else {
        setIntercomError("");
      }
      if (!comune) {
        setComuneError("Seleziona il comune di consegna");
        hasError = true;
      } else {
        setComuneError("");
      }
    }

    if (timeError || !preferredTime) {
      setTimeError("Seleziona un orario di ritiro/consegna valido prima di procedere");
      hasError = true;
    }

    if (hasError) return;

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
          <h2>
            Il Mio Ordine ({items.reduce((sum, item) => sum + item.quantita, 0)})
          </h2>
          <button
            className={styles.btnClosePanel}
            onClick={onClose}
            aria-label="Chiudi pannello"
          >
            &times;
          </button>
        </div>

        <div className={styles.orderPanelContent}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon} />
              <p className={styles.emptyStateText}>
                La tua lista è vuota. Inizia ad aggiungere i tuoi prodotti preferiti!
              </p>
              <button className={styles.btnPrimary} onClick={onClose}>
                Vai al Menù
              </button>
            </div>
          ) : (
            <>
              <div className={styles.orderItemsList}>
                {items.map((item) => {
                  const price =
                    typeof item.prezzo === "number"
                      ? item.prezzo
                      : parseFloat(String(item.prezzo)) || 0;
                  return (
                    <div key={item.id} className={styles.orderItem}>
                      <div className={styles.orderItemInfo}>
                        <div className={styles.orderItemName}>{item.nome}</div>
                        {item.customization && (
                          <div className={styles.orderItemCustomization}>
                            {item.customization.menuScelta && (
                              <span>Panino: {item.customization.menuScelta}</span>
                            )}
                            {item.customization.menuBevanda && (
                              <span>Bevanda: {item.customization.menuBevanda}</span>
                            )}
                            {item.customization.variante && (
                              <span>Formato: {item.customization.variante}</span>
                            )}
                            {item.customization.extras.length > 0 && (
                              <span>+ {item.customization.extras.map((e) => e.ingrediente).join(", ")}</span>
                            )}
                            {item.customization.removedIngredients.length > 0 && (
                              <span>- Senza: {item.customization.removedIngredients.join(", ")}</span>
                            )}
                            {item.customization.opzioniSpeciali?.length > 0 && (
                              <span>&#11088; {item.customization.opzioniSpeciali.join(", ")}</span>
                            )}
                          </div>
                        )}
                        <div className={styles.orderItemPrice}>
                          &euro;{price.toFixed(2)} cad.
                        </div>
                      </div>
                      <div className={styles.orderItemControls}>
                        <div className={styles.orderItemSubtotal}>
                          &euro;{(price * item.quantita).toFixed(2)}
                        </div>
                        <div className={styles.quantitySelector}>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantita - 1)}
                          >
                            &minus;
                          </button>
                          <span className={styles.quantity}>{item.quantita}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantita + 1)}
                            disabled={item.quantita >= CONFIG.maxQuantityPerItem}
                          >
                            +
                          </button>
                        </div>
                        <div className={styles.orderItemActions}>
                          {item.sourceProduct && onEditItem && (
                            <button
                              className={styles.btnEditItem}
                              onClick={() => onEditItem(item)}
                            >
                              Modifica
                            </button>
                          )}
                          <button
                            className={styles.btnRemoveItem}
                            onClick={() => onRemoveItem(item.id)}
                          >
                            Rimuovi
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.orderTotal}>
                <div className={styles.orderTotalRow}>
                  <span>Totale</span>
                  <span className={styles.orderTotalAmount}>
                    &euro;{calculateTotal().toFixed(2)}
                  </span>
                </div>
                <div className={styles.orderDeliveryInfo}>
                  <strong>Costo consegna a domicilio:</strong>
                  <br />
                  <span>
                    &bull; Desio:{" "}
                    <span className={styles.orderDeliveryAmount}>&euro;1,00</span>
                  </span>
                  <br />
                  <span>
                    &bull; Comuni limitrofi (Seregno, Lissone, Cesano Maderno, Muggiò, Nova
                    Milanese, Bovisio-Masciago, Varedo, Meda):{" "}
                    <span className={styles.orderDeliveryAmount}>&euro;2,00</span>
                  </span>
                </div>
              </div>

              <div className={styles.orderActions}>
                <button
                  className={styles.btnPrimary}
                  onClick={() => {
                    window.location.href = `tel:${CONFIG.phoneNumber}`;
                    toast("Tieni aperta questa lista mentre ordini", "success");
                  }}
                >
                  Chiama per Ordinare
                </button>

                <button
                  className={`${styles.btnSecondary} ${styles.btnWhatsapp}`}
                  onClick={handleShareWhatsAppClick}
                >
                  Condividi via WhatsApp
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

                <button
                  className={styles.btnClear}
                  onClick={() => setShowConfirm(true)}
                >
                  Svuota Lista
                </button>
              </div>
            </>
          )}
        </div>

        {showConfirm && (
          <div
            className={styles.confirmModalOverlay}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
          >
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

        <Modal
          open={modalVisible}
          onClose={() => setModalVisible(false)}
          title={<span style={{ color: "var(--color-text)", fontWeight: 600, fontSize: 18 }}>Condividi via WhatsApp</span>}
          footer={
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <Button label="Annulla" variant="secondary" onClick={() => setModalVisible(false)} />
              <Button label="Invia su WhatsApp" variant="primaryAlt" onClick={handleConfirmShare} />
            </div>
          }
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ color: "var(--color-text)" }}>Vuoi la consegna a domicilio?</span>
            <Switch
              checked={deliverySelected}
              onChange={(checked) => {
                setDeliverySelected(checked);
                if (!checked) {
                  setAddressError("");
                  setCivicError("");
                  setIntercomError("");
                  setComuneError("");
                }
              }}
            />
          </div>

          {deliverySelected && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Input
                placeholder="Indirizzo di consegna"
                value={address}
                error={!!addressError}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (e.target.value.trim() !== "") setAddressError("");
                }}
              />
              {addressError && (
                <div style={{ color: "var(--color-red)", marginBottom: 8, fontSize: "0.85rem" }}>
                  {addressError}
                </div>
              )}
              <Input
                placeholder="Numero civico"
                value={civicNumber}
                error={!!civicError}
                onChange={(e) => {
                  setCivicNumber(e.target.value);
                  if (e.target.value.trim() !== "") setCivicError("");
                }}
              />
              {civicError && (
                <div style={{ color: "var(--color-red)", marginBottom: 8, fontSize: "0.85rem" }}>
                  {civicError}
                </div>
              )}
              <Input
                placeholder="Nome sul citofono"
                value={intercom}
                error={!!intercomError}
                onChange={(e) => {
                  setIntercom(e.target.value);
                  if (e.target.value.trim() !== "") setIntercomError("");
                }}
              />
              {intercomError && (
                <div style={{ color: "var(--color-red)", marginBottom: 8, fontSize: "0.85rem" }}>
                  {intercomError}
                </div>
              )}
              <Select
                placeholder="Seleziona il comune"
                value={comune}
                error={!!comuneError}
                onChange={(value) => {
                  setComune(value);
                  if (value) setComuneError("");
                }}
                options={COMUNI_CONSEGNA.map((c) => ({
                  value: c.nome,
                  label: `${c.nome} (+€${c.sovrapprezzo},00)`,
                }))}
              />
              {comuneError && (
                <div style={{ color: "var(--color-red)", marginBottom: 8, fontSize: "0.85rem" }}>
                  {comuneError}
                </div>
              )}
            </div>
          )}

          <div>
            <p style={{ color: "var(--color-text)" }}>Puoi suggerire un orario preferito di ritiro o ricezione ordine:</p>
            <div className={styles.timeSlotsWrapper}>
              <div className={styles.timeSlotsContainer}>
                {slotsTimes.map((slot) => {
                  const disabled = isSlotDisabled(slot);
                  const isSelected = preferredTime !== null && slot.isSame(preferredTime);

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

            {timeError && <div className={styles.messageError}>{timeError}</div>}
            {infoMessage && !timeError && (
              <div className={styles.messageInfo}>{infoMessage}</div>
            )}
          </div>

          <p style={{ fontStyle: "italic", fontSize: "small", color: "var(--color-text-secondary)" }}>
            L&apos;ordine si può definire accettato solo quando si riceve un messaggio di
            risposta su WhatsApp. <br /> Il prezzo finale, in base ad eventuali modifiche o
            aggiunte, verrà confermato tramite WhatsApp.
          </p>
        </Modal>

        {showToast && (
          <div
            className={`${styles.toast} ${toastType === "success" ? styles.success : styles.error}`}
          >
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
