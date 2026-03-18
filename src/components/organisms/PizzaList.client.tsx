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
  handleAddToOrder: (item: MenuItem) => void;
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
      <p style={{ textAlign: "center", padding: "40px", color: "var(--color-text-primary)" }}>
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

        const formatRows = formats.reduce<string[][]>((rows, formato, idx) => {
          if (idx % 2 === 0) rows.push([formato]);
          else rows[rows.length - 1].push(formato);
          return rows;
        }, []);

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

            <div className={styles.prezzoBottomRight}>
              {hasFormats && formats.length > 0 && (
                <div className={styles.formatSelector}>
                  <label className={styles.formatLabel}>Formato:</label>
                  <div className={styles.formatButtons}>
                    {formatRows.map((row, i) => (
                      <div className={styles.formatRow} key={i}>
                        {row.map((formato) => (
                          <Button
                            key={formato}
                            role="button"
                            label={
                              <>
                                <span>{formato}</span>
                                <span className={styles.formatPrice}>
                                  {item.prezzi && item.prezzi[formato]
                                    ? `${parseFloat(String(item.prezzi[formato])).toFixed(2)}`
                                    : ""}
                                </span>
                              </>
                            }
                            variant={selectedFormat === formato ? "primaryAlt" : "secondary"}
                            isActive={selectedFormat === formato}
                            aria-selected={selectedFormat === formato}
                            onClick={() => setSelectedFormat(item, formato)}
                            size="small"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!hasFormats && item.prezzo && (
                <div>
                  <strong>Prezzo</strong> <em>{item.prezzo}&euro;</em>
                </div>
              )}

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
