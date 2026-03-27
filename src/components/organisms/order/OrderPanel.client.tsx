import { useState, useEffect, useRef, useCallback } from "react";

import { Modal } from "../../atoms";
import { Button } from "../../atoms/Button";
import styles from "../../../style/OrderPanel.module.css";
import { useTimeSlots } from "../../../hooks/useTimeSlots";
import { useOrderForm } from "../../../hooks/useOrderForm";
import { OrderSummary } from "./OrderSummary.client";
import { DeliveryForm } from "./DeliveryForm.client";
import { ConfettiCanvas } from "../../canvas/ConfettiCanvas.client";

import type { OrderItem } from "../../../types";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [showWhatsappConfirm, setShowWhatsappConfirm] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const wasOpen = useRef(false);

  const form = useOrderForm();
  const timeSlots = useTimeSlots(form.deliverySelected);

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const calculateTotal = () =>
    items.reduce((total, item) => {
      const price = typeof item.prezzo === "number" ? item.prezzo : parseFloat(String(item.prezzo)) || 0;
      return total + price * item.quantita;
    }, 0);

  const formatCustomizationText = (item: OrderItem): string => {
    if (!item.customization) return "";
    const parts: string[] = [];
    if (item.customization.menuScelta) parts.push(`  Panino: ${item.customization.menuScelta}`);
    if (item.customization.menuBevanda) parts.push(`  Bevanda: ${item.customization.menuBevanda}`);
    if (item.customization.variante) parts.push(`  Formato: ${item.customization.variante}`);
    if (item.customization.extras.length > 0) parts.push(`  + ${item.customization.extras.map((e) => e.ingrediente).join(", ")}`);
    if (item.customization.removedIngredients.length > 0) parts.push(`  - Senza: ${item.customization.removedIngredients.join(", ")}`);
    if (item.customization.opzioniSpeciali?.length > 0) parts.push(`  Opzioni: ${item.customization.opzioniSpeciali.join(", ")}`);
    return parts.length > 0 ? "\n" + parts.join("\n") : "";
  };

  const formatOrderText = () => {
    const subtotal = calculateTotal();
    const comuneData = form.deliverySelected ? form.getComuneData() : null;
    const deliverySurcharge = comuneData?.sovrapprezzo ?? 0;
    const grandTotal = subtotal + deliverySurcharge;

    let text = "🍕 *ORDINE LA TEGLIA*\n";
    text += "━━━━━━━━━━━━━━━━━━━━\n\n";

    items.forEach((item) => {
      const price = typeof item.prezzo === "number" ? item.prezzo : parseFloat(String(item.prezzo)) || 0;
      const lineTotal = price * item.quantita;
      text += `▸ *${item.quantita}x ${item.nome}*`;
      if (item.quantita > 1) text += ` (€${price.toFixed(2)} cad.)`;
      text += ` — €${lineTotal.toFixed(2)}`;
      text += formatCustomizationText(item);
      text += "\n";
    });

    text += "\n━━━━━━━━━━━━━━━━━━━━\n";
    text += `Subtotale prodotti: €${subtotal.toFixed(2)}\n`;
    if (form.deliverySelected && deliverySurcharge > 0) {
      text += `Consegna (${form.comune}): €${deliverySurcharge.toFixed(2)}\n`;
    }
    text += `\n💰 *TOTALE: €${grandTotal.toFixed(2)}*\n`;
    text += "━━━━━━━━━━━━━━━━━━━━\n\n";

    if (form.deliverySelected) {
      text += "📍 *Consegna a domicilio*\n";
      text += `${form.address}, ${form.civicNumber} — ${form.comune}\n`;
      text += `Citofono: ${form.intercom}\n`;
      text += `💳 Pagamento: ${form.paymentMethod === "carta" ? "Carta" : "Contanti"}\n`;
    } else {
      text += "🏪 *Ritiro in pizzeria*\n";
    }

    if (timeSlots.preferredTime) {
      text += `⏰ Orario preferito: ${timeSlots.preferredTime.format("HH:mm")}\n`;
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

  const scrollToFirstError = () => {
    const checks: [boolean, string][] = form.deliverySelected
      ? [
          [form.address.trim() === "", "address"],
          [form.civicNumber.trim() === "", "civic"],
          [form.intercom.trim() === "", "intercom"],
          [!form.comune, "comune"],
          [!form.paymentMethod, "payment"],
        ]
      : [];

    const firstFailing = checks.find(([failing]) => failing);
    if (firstFailing) {
      const el = document.querySelector(`[data-delivery-field="${firstFailing[1]}"]`) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        if (el.tagName === "INPUT") el.focus();
      }
    }
  };

  const handleValidateAndConfirm = () => {
    let hasError = false;

    if (form.deliverySelected && !form.validateDelivery()) {
      hasError = true;
    }

    if (timeSlots.timeError || !timeSlots.preferredTime) {
      timeSlots.setTimeError("Seleziona un orario di ritiro/consegna valido prima di procedere");
      hasError = true;
    }

    if (hasError) {
      scrollToFirstError();
      return;
    }

    setShowWhatsappConfirm(true);
  };

  const handleConfettiComplete = useCallback(() => {
    setConfettiTrigger(false);
  }, []);

  const handleSendWhatsapp = () => {
    const message = encodeURIComponent(formatOrderText());
    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${message}`, "_blank");
    setShowWhatsappConfirm(false);
    setModalVisible(false);
    setConfettiTrigger(true);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.orderOverlay} onClick={onClose}>
      <div
        className={`${styles.orderPanel} ${isOpen ? styles.active : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.orderPanelHeader}>
          <h2>Il Mio Ordine ({items.reduce((sum, item) => sum + item.quantita, 0)})</h2>
          <button className={styles.btnClosePanel} onClick={onClose} aria-label="Chiudi pannello">
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
              <button className={styles.btnPrimary} onClick={onClose}>Vai al Menù</button>
            </div>
          ) : (
            <>
              <OrderSummary
                items={items}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveItem={onRemoveItem}
                onEditItem={onEditItem}
                maxQuantityPerItem={CONFIG.maxQuantityPerItem}
              />

              <div className={styles.orderActions}>
                <button
                  className={`${styles.btnPrimary} ${styles.btnWhatsapp}`}
                  onClick={() => {
                    timeSlots.refreshDisabledSlots();
                    setModalVisible(true);
                  }}
                >
                  Invia ordine su WhatsApp
                </button>

                <button
                  className={`${styles.btnSecondary} ${styles.btnCall}`}
                  onClick={() => {
                    window.location.href = `tel:${CONFIG.phoneNumber}`;
                    toast("Tieni aperta questa lista mentre ordini", "success");
                  }}
                >
                  Chiama per Ordinare
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

        {showConfirm && (
          <div className={styles.confirmModalOverlay} tabIndex={-1} role="dialog" aria-modal="true">
            <div className={styles.confirmModal}>
              <div className={styles.confirmModalContent}>
                <h3>Sei sicuro di voler svuotare la lista?</h3>
                <div className={styles.confirmModalActions}>
                  <button className={styles.btnSecondary} onClick={() => setShowConfirm(false)}>
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
          title={<span className={styles.whatsappModalTitle}>Condividi via WhatsApp</span>}
          footer={
            <div className={styles.whatsappModalFooter}>
              <Button label="Annulla" variant="secondary" onClick={() => setModalVisible(false)} />
              <Button label="Invia su WhatsApp" variant="primaryAlt" onClick={handleValidateAndConfirm} />
            </div>
          }
        >
          <DeliveryForm form={form} />

          <div>
            <p className={styles.timeSlotsLabel}>
              Puoi suggerire un orario preferito di {form.deliverySelected ? "ricezione" : "ritiro"} ordine:
            </p>
            <div className={styles.timeSlotsWrapper}>
              <div className={styles.timeSlotsContainer}>
                {timeSlots.slotsTimes.map((slot) => {
                  const disabled = timeSlots.isSlotDisabled(slot);
                  const isSelected = timeSlots.preferredTime !== null && slot.isSame(timeSlots.preferredTime);
                  return (
                    <button
                      key={slot.format("HH:mm")}
                      onClick={() => timeSlots.handleSelectTime(slot)}
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
            {timeSlots.timeError && <div className={styles.messageError}>{timeSlots.timeError}</div>}
            {timeSlots.infoMessage && !timeSlots.timeError && (
              <div className={styles.messageInfo}>{timeSlots.infoMessage}</div>
            )}
          </div>

          <p className={styles.whatsappDisclaimer}>
            L&apos;ordine si può definire accettato solo quando si riceve un messaggio di
            risposta su WhatsApp. <br /> Il prezzo finale, in base ad eventuali modifiche o
            aggiunte, verrà confermato tramite WhatsApp.
          </p>
        </Modal>

        <Modal
          open={showWhatsappConfirm}
          onClose={() => setShowWhatsappConfirm(false)}
          zIndex={6000}
          title={<span className={styles.whatsappModalTitle}>Conferma invio ordine</span>}
          footer={
            <div className={styles.whatsappModalFooter}>
              <Button label="Annulla" variant="secondary" onClick={() => setShowWhatsappConfirm(false)} />
              <Button label="Conferma e invia" variant="primaryAlt" onClick={handleSendWhatsapp} />
            </div>
          }
        >
          <div className={styles.confirmSummary}>
            <p className={styles.confirmRow}>
              {form.deliverySelected
                ? `Consegna a ${form.address}, ${form.civicNumber} — ${form.comune}`
                : "Ritiro in pizzeria"}
            </p>
            {timeSlots.preferredTime && (
              <p className={styles.confirmRow}>Orario preferito: {timeSlots.preferredTime.format("HH:mm")}</p>
            )}
            {form.deliverySelected && (() => {
              const comuneData = form.getComuneData();
              const surcharge = comuneData?.sovrapprezzo ?? 0;
              const subtotal = calculateTotal();
              return (
                <>
                  <p className={styles.confirmRow}>Subtotale prodotti: &euro;{subtotal.toFixed(2)}</p>
                  {surcharge > 0 && (
                    <p className={styles.confirmRow}>Consegna ({form.comune}): &euro;{surcharge.toFixed(2)}</p>
                  )}
                  <p className={styles.confirmTotal}>
                    Totale: &euro;{(subtotal + surcharge).toFixed(2)}
                  </p>
                </>
              );
            })()}
            {!form.deliverySelected && (
              <p className={styles.confirmTotal}>
                Totale: &euro;{calculateTotal().toFixed(2)}
              </p>
            )}
          </div>
        </Modal>

        {showToast && (
          <div className={`${styles.toast} ${toastType === "success" ? styles.success : styles.error}`}>
            {toastMessage}
          </div>
        )}
      </div>
      <ConfettiCanvas trigger={confettiTrigger} onComplete={handleConfettiComplete} />
    </div>
  );
};
