import { useState, useMemo, useEffect } from "react";

import styles from "../../style/MenuSection.module.css";

import { pizze } from "../../data/pizze.json";
import { calzoni } from "../../data/calzoni.json";
import { focacce_rotonde } from "../../data/focacce_rotonde.json";
import { insalatone_con_pane } from "../../data/insalatone_con_pane.json";
import { gastronomia_e_specialita_friggitoria } from "../../data/gastronomia_e_specialita_friggitoria.json";
import { doner_kebab } from "../../data/doner_kebab.json";
import { panini_e_piadine } from "../../data/panini_e_piadine.json";
import { dolci } from "../../data/dolci.json";
import { bevande } from "../../data/bevande.json";
import { offerte_menu } from "../../data/offerte_menu.json";
import { ingredienti } from "../../data/ingredienti.json";
import { allergeniIcons } from "../../config/allergeniIcons";
import allergeniData from "../../data/allergeni.json";
import { Button } from "../atoms/Button";
import { IngredientiModal } from "./IngredientiModal.client";
import { PizzaSearch } from "./PizzaSearch.client";
import { PizzaList } from "./PizzaList.client";
import { useMenuLogic } from "../../hooks/useMenuLogic";
import { useOrder } from "../../context/OrderContext";

import type { MenuItem, AllergeniData, AllergeniIconsMap, Ingrediente } from "../../types";

const SECTIONS = [
  "Pizze",
  "Menu",
  "Calzoni",
  "Focacce Rotonde",
  "Insalatone",
  "Gastronomia",
  "Doner Kebab",
  "Panini e Piadine",
  "Dolci",
  "Bevande",
] as const;

const contenuti: Record<string, MenuItem[]> = {
  Pizze: pizze as MenuItem[],
  Menu: offerte_menu as MenuItem[],
  Calzoni: calzoni as MenuItem[],
  "Focacce Rotonde": focacce_rotonde as MenuItem[],
  Insalatone: insalatone_con_pane as MenuItem[],
  Gastronomia: gastronomia_e_specialita_friggitoria as MenuItem[],
  "Doner Kebab": doner_kebab as MenuItem[],
  "Panini e Piadine": panini_e_piadine as MenuItem[],
  Dolci: dolci as MenuItem[],
  Bevande: bevande as MenuItem[],
};

interface MenuSectionProps {
  id: string;
}

export const MenuSection = ({ id }: MenuSectionProps) => {
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [tooltipId, setTooltipId] = useState<string | null>(null);

  const { editRequest, setEditRequest } = useOrder();

  const {
    isIngredientModalOpen,
    setIsIngredientModalOpen,
    selectedProduct,
    selectedExtras,
    initialCustomization,
    editingItemId,
    generateProductBaseId,
    hasMultipleFormats,
    getAvailableFormats,
    getSelectedFormat,
    setSelectedFormat,
    getCurrentFormatQuantity,
    getQuantities,
    handleOpenIngredientModal,
    handleToggleExtra,
    handleAddToOrder,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
    handleEditFromCart,
  } = useMenuLogic(activeSection);

  useEffect(() => {
    if (editRequest) {
      handleEditFromCart(editRequest);
      setEditRequest(null);
    }
  }, [editRequest, handleEditFromCart, setEditRequest]);

  useEffect(() => {
    if (isIngredientModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isIngredientModalOpen]);

  useEffect(() => {
    setSearchInput("");
  }, [activeSection]);

  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(searchInput.trim()), 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const itemsRaw = contenuti[activeSection] || [];

  const itemsSelezionati = useMemo(() => {
    if (!searchTerm) return itemsRaw;
    const lowerSearch = searchTerm.toLowerCase();
    return itemsRaw.filter(
      (item) =>
        item.nome.toLowerCase().includes(lowerSearch) ||
        (item.ingredienti && item.ingredienti.toLowerCase().includes(lowerSearch))
    );
  }, [itemsRaw, searchTerm]);

  const quantities = useMemo(
    () => getQuantities(itemsSelezionati),
    [getQuantities, itemsSelezionati]
  );

  const handleAllergeneTouch = (pizzaName: string, allergeneId: number) => {
    const touchId = `${pizzaName}-${allergeneId}`;
    setTooltipId(tooltipId === touchId ? null : touchId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(`.${styles.allergeniContainer}`)) {
        setTooltipId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <section className={styles.menuSection} id={id}>
      <h2 className={styles.title}>IL NOSTRO MENU</h2>

      <div className={styles.filterContainer}>
        {SECTIONS.map((section) => (
          <Button
            key={section}
            role="tab"
            label={section}
            variant="primary"
            isActive={activeSection === section}
            aria-selected={activeSection === section}
            onClick={() => setActiveSection(section)}
          />
        ))}
      </div>

      <PizzaSearch searchInput={searchInput} setSearchInput={setSearchInput} />

      <PizzaList
        itemsSelezionati={itemsSelezionati}
        quantities={quantities}
        allergeniData={allergeniData as AllergeniData}
        allergeniIcons={allergeniIcons as AllergeniIconsMap}
        tooltipId={tooltipId}
        handleAllergeneTouch={handleAllergeneTouch}
        getCurrentFormatQuantity={getCurrentFormatQuantity}
        hasMultipleFormats={hasMultipleFormats}
        getAvailableFormats={getAvailableFormats}
        getSelectedFormat={getSelectedFormat}
        setSelectedFormat={setSelectedFormat}
        handleDecreaseQuantity={handleDecreaseQuantity}
        handleIncreaseQuantity={handleIncreaseQuantity}
        handleOpenIngredientModal={handleOpenIngredientModal}
        handleAddToOrder={handleAddToOrder}
        generateProductBaseId={generateProductBaseId}
      />

      {isIngredientModalOpen && (
        <IngredientiModal
          open={isIngredientModalOpen}
          onClose={() => setIsIngredientModalOpen(false)}
          ingredienti={ingredienti as Ingrediente[]}
          selectedProduct={selectedProduct}
          selectedExtras={selectedExtras}
          handleToggleExtra={handleToggleExtra}
          handleAddToOrder={handleAddToOrder}
          initialCustomization={initialCustomization}
          isEditMode={!!editingItemId}
          showSpecialOptions={["Pizze", "Calzoni", "Focacce Rotonde"].includes(activeSection)}
        />
      )}
    </section>
  );
};
