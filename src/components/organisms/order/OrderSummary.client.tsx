import styles from "../../../style/OrderPanel.module.css";

import type { OrderItem } from "../../../types";

interface OrderSummaryProps {
  items: OrderItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onEditItem?: (item: OrderItem) => void;
  maxQuantityPerItem: number;
}

export const OrderSummary = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onEditItem,
  maxQuantityPerItem,
}: OrderSummaryProps) => {
  const calculateTotal = () =>
    items.reduce((total, item) => {
      const price = typeof item.prezzo === "number" ? item.prezzo : parseFloat(String(item.prezzo)) || 0;
      return total + price * item.quantita;
    }, 0);

  return (
    <>
      <div className={styles.orderItemsList}>
        {items.map((item) => {
          const price = typeof item.prezzo === "number" ? item.prezzo : parseFloat(String(item.prezzo)) || 0;
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
                  <button onClick={() => onUpdateQuantity(item.id, item.quantita - 1)}>
                    &minus;
                  </button>
                  <span className={styles.quantity}>{item.quantita}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantita + 1)}
                    disabled={item.quantita >= maxQuantityPerItem}
                  >
                    +
                  </button>
                </div>
                <div className={styles.orderItemActions}>
                  {item.sourceProduct && onEditItem && (
                    <button className={styles.btnEditItem} onClick={() => onEditItem(item)}>
                      Modifica
                    </button>
                  )}
                  <button className={styles.btnRemoveItem} onClick={() => onRemoveItem(item.id)}>
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
      </div>
    </>
  );
};
