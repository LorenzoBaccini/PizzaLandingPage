import { useEffect, useState, useCallback } from "react";

import { Modal, Checkbox, Collapse, Radio, RadioGroup, Button } from "../atoms";
import genericStyle from "../../style/generic.module.css";
import styles from "../../style/IngredientiModal.module.css";

import type { MenuItem, Ingrediente, OrderItemCustomization, MenuItemVariante } from "../../types";

const SPECIAL_OPTIONS = [
  { nome: "Impasto integrale", prezzo: 1.00 },
  { nome: "Mozzarella senza lattosio", prezzo: 1.50 },
];

const MENU_BEVANDE = [
  { nome: "Acqua naturale 33cl" },
  { nome: "Acqua frizzante 33cl" },
  { nome: "Coca Cola 33cl" },
  { nome: "Coca Zero 33cl" },
  { nome: "Sprite 33cl" },
  { nome: "Fanta 33cl" },
  { nome: "Tè pesca 33cl" },
  { nome: "Tè limone 33cl" },
];

interface IngredientiModalProps {
  open: boolean;
  onClose: () => void;
  ingredienti: Ingrediente[];
  selectedProduct: MenuItem | null;
  selectedExtras: Ingrediente[];
  handleToggleExtra: (ingrediente: string, formato: string | null | undefined) => void;
  handleAddToOrder: (product: MenuItem, customization?: OrderItemCustomization) => void;
  initialCustomization?: OrderItemCustomization;
  isEditMode?: boolean;
  showSpecialOptions?: boolean;
}

export const IngredientiModal = ({
  open,
  onClose,
  ingredienti,
  selectedProduct,
  selectedExtras,
  handleToggleExtra,
  handleAddToOrder,
  initialCustomization,
  isEditMode = false,
  showSpecialOptions = false,
}: IngredientiModalProps) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [selectedBevanda, setSelectedBevanda] = useState<{ nome: string } | null>(null);
  const [selectedVariante, setSelectedVariante] = useState<MenuItemVariante | null>(null);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [selectedSpecialOptions, setSelectedSpecialOptions] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bevandeOpen, setBevandeOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedMenuItem(null);
      setSelectedBevanda(null);
      setSelectedVariante(null);
      setRemovedIngredients([]);
      setSelectedSpecialOptions([]);
      setMenuOpen(false);
      setBevandeOpen(false);
      return;
    }

    if (selectedProduct?.bevandaFissa) {
      setSelectedBevanda({ nome: selectedProduct.bevandaFissa });
    }

    if (initialCustomization) {
      setRemovedIngredients(initialCustomization.removedIngredients || []);
      setSelectedSpecialOptions(initialCustomization.opzioniSpeciali || []);

      if (initialCustomization.variante && selectedProduct?.varianti) {
        const v = selectedProduct.varianti.find((va) => va.tipo === initialCustomization.variante);
        if (v) setSelectedVariante(v);
      }

      if (initialCustomization.menuScelta && selectedProduct?.scelta) {
        const m = selectedProduct.scelta.find((s) => s.nome === initialCustomization.menuScelta);
        if (m) setSelectedMenuItem(m);
      }

      if (initialCustomization.menuBevanda) {
        const b = MENU_BEVANDE.find((bev) => bev.nome === initialCustomization.menuBevanda);
        if (b) setSelectedBevanda(b);
      }
    }
  }, [open, initialCustomization, selectedProduct?.varianti, selectedProduct?.scelta, selectedProduct?.bevandaFissa]);

  const handleToggleRemove = useCallback((nomeIngrediente: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(nomeIngrediente)
        ? prev.filter((i) => i !== nomeIngrediente)
        : [...prev, nomeIngrediente]
    );
  }, []);

  const handleConfirmOrder = useCallback(() => {
    if (!selectedProduct) return;

    const customization: OrderItemCustomization = {
      extras: selectedExtras,
      removedIngredients,
      variante: selectedVariante?.tipo ?? null,
      menuScelta: selectedMenuItem?.nome ?? null,
      menuBevanda: selectedBevanda?.nome ?? null,
      opzioniSpeciali: selectedSpecialOptions,
    };

    const hasCustomization =
      customization.extras.length > 0 ||
      customization.removedIngredients.length > 0 ||
      customization.variante !== null ||
      customization.menuScelta !== null ||
      customization.menuBevanda !== null ||
      customization.opzioniSpeciali.length > 0;

    handleAddToOrder(selectedProduct, hasCustomization ? customization : undefined);
    onClose();
  }, [
    selectedProduct,
    selectedExtras,
    removedIngredients,
    selectedMenuItem,
    selectedBevanda,
    selectedVariante,
    selectedSpecialOptions,
    handleAddToOrder,
    onClose,
  ]);

  const menuOptions = selectedProduct?.scelta || [];
  const removableIngredients = selectedProduct?.ingredienti_removibili || [];
  const varianti = selectedProduct?.varianti || [];
  const isMenu = !!selectedProduct?.tipo?.startsWith("menu");
  const showExtras = selectedProduct?.personalizzabile !== false;

  const menuPaninoHaRemovibili =
    (selectedMenuItem as MenuItem | null)?.ingredienti_removibili &&
    (selectedMenuItem as MenuItem | null)!.ingredienti_removibili!.length > 0;
  const currentRemovableIngredients = menuPaninoHaRemovibili
    ? (selectedMenuItem as MenuItem).ingredienti_removibili!
    : removableIngredients;

  const isMenuPaninoComplete = !menuOptions.length || !!selectedMenuItem;
  const isMenuBevandaComplete = !isMenu || !!selectedBevanda;
  const isMenuComplete = isMenuPaninoComplete && isMenuBevandaComplete;
  const isVarianteComplete = !varianti.length || !!selectedVariante;
  const isReadyToOrder = isMenuComplete && isVarianteComplete;

  const getPrezzoFinaleExtra = useCallback(
    (prezzo: number) => {
      const formato =
        selectedProduct?.formato || (selectedMenuItem as MenuItem | null)?.formato;
      return formato === "Teglia intera" || formato === "Famiglia" ? prezzo * 2 : prezzo;
    },
    [selectedProduct?.formato, (selectedMenuItem as MenuItem | null)?.formato]
  );

  const getFormatoPerExtra = () => {
    return (selectedMenuItem as MenuItem | null)?.formato || selectedProduct?.formato;
  };

  const totalModifiche = selectedExtras.length + removedIngredients.length;

  const getButtonLabel = () => {
    if (!isReadyToOrder) {
      return isMenu ? "Completa menu" : "Completa la selezione";
    }
    if (isEditMode) {
      return totalModifiche > 0
        ? `Aggiorna ${totalModifiche} modifi${totalModifiche === 1 ? "ca" : "che"}`
        : "Aggiorna senza modifiche";
    }
    return totalModifiche > 0
      ? `Aggiungi ${totalModifiche} modifi${totalModifiche === 1 ? "ca" : "che"}`
      : "Aggiungi senza modifiche";
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div>
          <p className={genericStyle.nomeProdotto}>{selectedProduct?.nome}</p>
          {selectedProduct?.formato && (
            <p className={genericStyle.ingredienti}>
              <span className={styles.formatLabel}> Formato: </span>
              {selectedProduct.formato}
            </p>
          )}
          <p className={`${genericStyle.ingredienti} ${styles.titleBorder}`}>
            {!isMenu && (
              <span className={styles.formatLabel}> Ingredienti: </span>
            )}
            {selectedProduct?.ingredienti}
          </p>
          <p style={{ margin: "10px 0 0 0", fontSize: 18, fontWeight: 600, color: "var(--color-text)" }}>
            {isMenu
              ? "Menu completo"
              : currentRemovableIngredients.length > 0
                ? "Personalizza"
                : "Ingredienti extra"}
          </p>
        </div>
      }
      footer={
        <div className={styles.footerButtons}>
          <Button
            label={getButtonLabel()}
            variant="primaryAlt"
            onClick={handleConfirmOrder}
            disabled={!isReadyToOrder}
            style={{ minWidth: 160 }}
          />
          <Button label="Annulla" variant="secondary" onClick={onClose} />
        </div>
      }
    >
      <div className={styles.scrollBody}>
        {menuOptions.length > 0 && (
          <Collapse
            isOpen={menuOpen}
            onToggle={() => setMenuOpen(!menuOpen)}
            header={
              <div className={styles.collapseHeader}>
                <div className={styles.collapseHeaderText}>
                  <span className={`${styles.collapseHeaderLabel} ${selectedMenuItem ? styles.selected : styles.unselected}`}>
                    {selectedMenuItem
                      ? selectedMenuItem.nome
                      : `Seleziona ${selectedProduct?.nome?.toLowerCase().includes("piadina") ? "piadina" : "panino"} del menu`}
                  </span>
                </div>
                <span className={selectedMenuItem ? styles.badgeSelected : styles.badgeRequired}>
                  {selectedMenuItem ? "Selezionato" : "Obbligatorio"}
                </span>
              </div>
            }
          >
            {menuOptions.map((item: MenuItem) => (
              <div
                key={item.nome}
                className={selectedMenuItem?.nome === item.nome ? styles.menuItemSelected : styles.menuItem}
                onClick={() => setSelectedMenuItem(item)}
              >
                <div className={styles.menuItemName}>{item.nome}</div>
                {item.ingredienti && (
                  <div className={styles.menuItemIngredients}>{item.ingredienti}</div>
                )}
              </div>
            ))}
          </Collapse>
        )}

        {isMenu && !selectedProduct?.bevandaFissa && (
          <Collapse
            isOpen={bevandeOpen}
            onToggle={() => setBevandeOpen(!bevandeOpen)}
            header={
              <div className={styles.collapseHeader}>
                <div className={styles.collapseHeaderText}>
                  <span className={`${styles.collapseHeaderLabel} ${selectedBevanda ? styles.selected : styles.unselected}`}>
                    {selectedBevanda ? selectedBevanda.nome : "Seleziona bevanda"}
                  </span>
                </div>
                <span className={selectedBevanda ? styles.badgeSelected : styles.badgeRequired}>
                  {selectedBevanda ? "Selezionata" : "Obbligatoria"}
                </span>
              </div>
            }
          >
            {MENU_BEVANDE.map((bevanda) => (
              <div
                key={bevanda.nome}
                className={selectedBevanda?.nome === bevanda.nome ? styles.bevandaItemSelected : styles.bevandaItem}
                onClick={() => setSelectedBevanda(bevanda)}
              >
                <span className={styles.bevandaName}>{bevanda.nome}</span>
                <span className={styles.bevandaBadge}>Inclusa</span>
              </div>
            ))}
          </Collapse>
        )}

        {varianti.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4 className={styles.sectionTitleFormato}>Formato</h4>
            <RadioGroup>
              {varianti.map((v) => (
                <Radio
                  key={v.tipo}
                  value={v.tipo}
                  selected={selectedVariante?.tipo === v.tipo}
                  onChange={(val) => {
                    const found = varianti.find((va) => va.tipo === val);
                    setSelectedVariante(found ?? null);
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: 15 }}>
                    {v.tipo.charAt(0).toUpperCase() + v.tipo.slice(1)}
                  </span>
                  {v.sovrapprezzo > 0 && (
                    <span className={styles.priceTag}>
                      (+{v.sovrapprezzo}&euro;)
                    </span>
                  )}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        )}

        {showExtras && (currentRemovableIngredients.length > 0 || removedIngredients.length > 0) && (
          <div style={{ marginBottom: 20 }}>
            <h4 className={styles.sectionTitleRemove}>
              Rimuovi ingredienti
              {menuPaninoHaRemovibili && (
                <span className={styles.subLabel}>
                  ({(selectedMenuItem as MenuItem).nome})
                </span>
              )}
            </h4>
            {currentRemovableIngredients.map((nome: string) => {
              const isRemoved = removedIngredients.includes(nome);
              return (
                <div className={styles.listItem} key={nome}>
                  <Checkbox checked={isRemoved} onChange={() => handleToggleRemove(nome)}>
                    Rimuovi <span className={styles.boldName}>{nome}</span>
                  </Checkbox>
                </div>
              );
            })}
          </div>
        )}

        {showExtras && ingredienti?.length > 0 && (
          <div>
            <h4 className={styles.sectionTitleExtra}>Aggiungi extra</h4>
            {ingredienti.map(({ ingrediente, prezzo }: Ingrediente) => {
              const isChecked = selectedExtras.some((e) => e.ingrediente === ingrediente);
              const prezzoFinale = getPrezzoFinaleExtra(prezzo);
              return (
                <div className={styles.listItem} key={ingrediente}>
                  <Checkbox
                    checked={isChecked}
                    onChange={() => handleToggleExtra(ingrediente, getFormatoPerExtra())}
                  >
                    <strong>{ingrediente}</strong>{" "}
                    <span className={styles.priceTag}>
                      (+{prezzoFinale.toFixed(2)} &euro;)
                    </span>
                  </Checkbox>
                </div>
              );
            })}
          </div>
        )}

        {showExtras && showSpecialOptions && (
          <div style={{ marginBottom: 20 }}>
            <h4 className={styles.sectionTitleSpecial}>Opzioni speciali</h4>
            {SPECIAL_OPTIONS.map(({ nome, prezzo }) => {
              const isChecked = selectedSpecialOptions.includes(nome);
              return (
                <div className={styles.listItem} key={nome}>
                  <Checkbox
                    checked={isChecked}
                    onChange={() =>
                      setSelectedSpecialOptions((prev) =>
                        prev.includes(nome)
                          ? prev.filter((o) => o !== nome)
                          : [...prev, nome]
                      )
                    }
                  >
                    <strong>{nome}</strong>{" "}
                    <span className={styles.priceTag}>
                      (+{prezzo.toFixed(2)} &euro;)
                    </span>
                  </Checkbox>
                </div>
              );
            })}
          </div>
        )}

        {!menuOptions.length &&
          !varianti.length &&
          !currentRemovableIngredients.length &&
          !ingredienti?.length &&
          !showSpecialOptions && (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>&#x2705;</div>
              <div className={styles.emptyStateTitle}>Perfetto!</div>
              <div className={styles.emptyStateSubtitle}>
                Questo prodotto non richiede personalizzazioni
              </div>
            </div>
          )}
      </div>
    </Modal>
  );
};
