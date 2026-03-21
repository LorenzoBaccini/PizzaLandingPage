import styles from "../../style/MenuSection.module.css";
import genericStyles from "../../style/generic.module.css";
import { Button } from "../atoms/Button";

import type { MenuItem, AllergeniData, AllergeniIconsMap } from "../../types";

interface PizzaListProps {
  itemsSelezionati: MenuItem[];
  quantities: Record<string, number>;
  allergeniData: AllergeniData;
  allergeniIcons: AllergeniIconsMap;
  tooltipId: string | null;
  handleAllergeneTouch: (pizzaName: string, allergeneId: number) => void;
  getCurrentFormatQuantity: (item: MenuItem) => number;
  hasMultipleFormats: (item: MenuItem) => boolean;
  getAvailableFormats: (item: MenuItem) => string[];
  getSelectedFormat: (item: MenuItem) => string | null;
  setSelectedFormat: (item: MenuItem, formato: string) => void;
  handleDecreaseQuantity: (item: MenuItem) => void;
  handleIncreaseQuantity: (item: MenuItem) => void;
  handleOpenIngredientModal: (item: MenuItem) => void;
  handleAddToOrder: (item: MenuItem, customization?: import("../../types").OrderItemCustomization) => void;
  generateProductBaseId: (item: MenuItem) => string;
}

export const PizzaList = ({
  itemsSelezionati,
  quantities,
  allergeniData,
  allergeniIcons,
  tooltipId,
  handleAllergeneTouch,
  getCurrentFormatQuantity,
  hasMultipleFormats,
  getAvailableFormats,
  getSelectedFormat,
  setSelectedFormat,
  handleDecreaseQuantity,
  handleIncreaseQuantity,
  handleOpenIngredientModal,
  handleAddToOrder,
  generateProductBaseId,
}: PizzaListProps) => {
  if (itemsSelezionati.length === 0) {
    return (
      <p style={{ textAlign: "center", padding: "40px", color: "var(--color-text)" }}>
        Contenuto in aggiornamento...
      </p>
    );
  }

  return (
    <ul className={styles.pizzaList}>
      {itemsSelezionati.map((item, index) => {
        const baseId = generateProductBaseId(item);
        const totalQuantity = quantities[baseId] || 0;
        const currentFormatQuantity = getCurrentFormatQuantity(item);
        const hasFormats = hasMultipleFormats(item);
        const formats = getAvailableFormats(item);
        const selectedFormat = getSelectedFormat(item);

        return (
          <li key={`${baseId}_${index}`} className={styles.pizzaCard}>
            <div className={styles.cardHeader}>
              <h3 className={genericStyles.nomeProdotto}>
                {item.nome}
                {item.quantita && ` - ${item.quantita}`}
                {totalQuantity > 0 && (
                  <span className={styles.totalBadge}> ({totalQuantity})</span>
                )}
              </h3>
              <div key={item.nome} className={styles.allergeniContainer}>
                {item.allergeni?.map((allergeneId) => {
                  const allergeneInfo = allergeniData.allergeni.find(
                    (a) => a.id === allergeneId
                  );
                  const Icon = allergeniIcons[allergeneId];
                  const uniqueId = `${item.nome}-${allergeneId}`;

                  return (
                    Icon && (
                      <span
                        onClick={() => handleAllergeneTouch(item.nome, allergeneId)}
                        className={styles.allergeneIcon}
                        key={uniqueId}
                        title={allergeneInfo?.nome || "Allergene"}
                        style={{ position: "relative" }}
                      >
                        <Icon />
                        {tooltipId === uniqueId && (
                          <span className={styles.tooltip}>{allergeneInfo?.nome}</span>
                        )}
                      </span>
                    )
                  );
                })}
              </div>
            </div>

            {item.ingredienti && (
              <p className={genericStyles.ingredienti}>{item.ingredienti}</p>
            )}

            {hasFormats && formats.length > 0 && (
              <div className={styles.formatSelector}>
                <label className={styles.formatLabel}>Formato:</label>
                <div className={styles.formatButtons}>
                  {formats.map((formato) => (
                    <button
                      key={formato}
                      className={`${styles.formatChip} ${selectedFormat === formato ? styles.formatChipActive : ""}`}
                      onClick={() => setSelectedFormat(item, formato)}
                      aria-selected={selectedFormat === formato}
                    >
                      {formato}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.orderRow}>
              <div className={styles.priceDisplay}>
                {hasFormats && selectedFormat && item.prezzi?.[selectedFormat] != null ? (
                  <>
                    <span className={styles.priceAmount}>
                      {parseFloat(String(item.prezzi[selectedFormat])).toFixed(2)}&euro;
                    </span>
                    <span className={styles.priceFormat}>{selectedFormat}</span>
                  </>
                ) : !hasFormats && item.prezzo != null ? (
                  <span className={styles.priceAmount}>
                    {parseFloat(String(item.prezzo)).toFixed(2)}&euro;
                  </span>
                ) : hasFormats ? (
                  <span className={styles.priceHint}>Scegli un formato</span>
                ) : null}
              </div>

              <div className={styles.orderControls}>
                {!item.personalizzabile && (
                  <div className={styles.quantitySelector}>
                    <button
                      onClick={() => handleDecreaseQuantity(item)}
                      disabled={currentFormatQuantity === 0}
                      aria-label="Diminuisci quantità"
                      className={styles.quantityBtn}
                    >
                      &minus;
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
                )}
                {item.personalizzabile ? (
                  <Button
                    role="button"
                    label="Aggiungi"
                    variant="primaryAlt"
                    onClick={() => handleOpenIngredientModal(item)}
                  />
                ) : (
                  <Button
                    role="button"
                    label="Aggiungi"
                    variant="primaryAlt"
                    onClick={() => handleAddToOrder(item)}
                  />
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
