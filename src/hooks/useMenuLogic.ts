import { useState, useCallback, useMemo } from "react";

import { useOrder } from "../context/OrderContext";
import { ingredienti } from "../data/ingredienti.json";

import type { MenuItem, Ingrediente } from "../types";

export const useMenuLogic = (activeSection: string) => {
  const { addItem, getItemQuantity, updateQuantity } = useOrder();

  const [selectedFormats, setSelectedFormats] = useState<Record<string, string>>({});
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Ingrediente[]>([]);

  const generateProductBaseId = useCallback(
    (item: MenuItem) => {
      return `${activeSection.toLowerCase().replace(/\s+/g, "_")}_${item.nome.toLowerCase().replace(/\s+/g, "_")}`;
    },
    [activeSection]
  );

  const generateProductId = useCallback(
    (item: MenuItem, formato: string | null = null) => {
      const baseId = generateProductBaseId(item);
      if (formato) {
        return `${baseId}_${formato.toLowerCase().replace(/\s+/g, "_")}`;
      }
      return baseId;
    },
    [generateProductBaseId]
  );

  const hasMultipleFormats = useCallback((item: MenuItem) => {
    return (
      item.prezzi &&
      typeof item.prezzi === "object" &&
      Object.keys(item.prezzi).length > 1
    );
  }, []);

  const getAvailableFormats = useCallback((item: MenuItem) => {
    if (!item.prezzi) return [];
    return Object.keys(item.prezzi);
  }, []);

  const getSelectedFormat = useCallback(
    (item: MenuItem) => {
      const baseId = generateProductBaseId(item);
      if (selectedFormats[baseId]) {
        return selectedFormats[baseId];
      }
      const formats = getAvailableFormats(item);
      return formats.length > 0 ? formats[0] : null;
    },
    [generateProductBaseId, selectedFormats, getAvailableFormats]
  );

  const setSelectedFormat = useCallback(
    (item: MenuItem, formato: string) => {
      const baseId = generateProductBaseId(item);
      setSelectedFormats((prev) => ({ ...prev, [baseId]: formato }));
    },
    [generateProductBaseId]
  );

  const getPrice = useCallback(
    (item: MenuItem, formato: string | null = null) => {
      if (item.prezzo) return parseFloat(String(item.prezzo));
      if (item.prezzi) {
        if (formato && item.prezzi[formato]) {
          return parseFloat(String(item.prezzi[formato]));
        }
        const selected = getSelectedFormat(item);
        if (selected && item.prezzi[selected]) {
          return parseFloat(String(item.prezzi[selected]));
        }
        const firstPrice = Object.values(item.prezzi)[0];
        return parseFloat(String(firstPrice));
      }
      return 0;
    },
    [getSelectedFormat]
  );

  const getCurrentFormatQuantity = useCallback(
    (item: MenuItem) => {
      if (hasMultipleFormats(item)) {
        const formato = getSelectedFormat(item);
        const id = generateProductId(item, formato);
        return getItemQuantity(id);
      }
      const id = generateProductId(item);
      return getItemQuantity(id);
    },
    [hasMultipleFormats, getSelectedFormat, generateProductId, getItemQuantity]
  );

  const getQuantities = useCallback(
    (items: MenuItem[]) => {
      const newQuantities: Record<string, number> = {};
      items.forEach((item) => {
        const baseId = generateProductBaseId(item);
        if (hasMultipleFormats(item)) {
          const formats = getAvailableFormats(item);
          const total = formats.reduce((sum, formato) => {
            const id = generateProductId(item, formato);
            return sum + getItemQuantity(id);
          }, 0);
          newQuantities[baseId] = total;
        } else {
          const id = generateProductId(item);
          newQuantities[baseId] = getItemQuantity(id);
        }
      });
      return newQuantities;
    },
    [generateProductBaseId, hasMultipleFormats, getAvailableFormats, generateProductId, getItemQuantity]
  );

  const handleOpenIngredientModal = useCallback(
    (product: MenuItem) => {
      const formato = hasMultipleFormats(product) ? getSelectedFormat(product) : null;
      const price = getPrice(product, formato);
      const enriched: MenuItem = {
        ...product,
        formato: formato ?? undefined,
        prezzo: price,
        selectedExtras: selectedExtras,
      };
      setSelectedProduct(enriched);
      setSelectedExtras([]);
      setIsIngredientModalOpen(true);
    },
    [hasMultipleFormats, getSelectedFormat, getPrice, selectedExtras]
  );

  const handleToggleExtra = useCallback(
    (ingrediente: string, formato: string | null | undefined) => {
      if (selectedExtras.some((e) => e.ingrediente === ingrediente)) {
        setSelectedExtras((prev) => prev.filter((e) => e.ingrediente !== ingrediente));
      } else {
        const extra = (ingredienti as Ingrediente[]).find(
          (i) => i.ingrediente === ingrediente
        );
        if (extra) {
          const formatiNoMoltiplica = ["1/4 di Teglia", "1/2 Teglia", "Rotonda"];
          const prezzoFinale =
            formato && formatiNoMoltiplica.includes(formato)
              ? extra.prezzo
              : extra.prezzo * 2;
          setSelectedExtras((prev) => [...prev, { ...extra, prezzo: prezzoFinale }]);
        }
      }
    },
    [selectedExtras]
  );

  const handleAddToOrder = useCallback(
    (item: MenuItem) => {
      const itemWithExtras =
        selectedExtras.length > 0
          ? { ...item, selectedExtras: selectedExtras }
          : item;

      const formato = hasMultipleFormats(itemWithExtras)
        ? getSelectedFormat(itemWithExtras)
        : null;
      const productId = generateProductId(itemWithExtras, formato);
      const price = getPrice(itemWithExtras, formato);

      let productName = itemWithExtras.nome;
      if (formato) {
        productName = `${itemWithExtras.nome} (${formato})`;
      }

      const product = {
        id: productId,
        nome: productName,
        prezzo: price,
      };

      if (isIngredientModalOpen) {
        setIsIngredientModalOpen(false);
        setSelectedProduct(null);
        setSelectedExtras([]);
      }

      addItem(product, 1);
    },
    [
      selectedExtras,
      hasMultipleFormats,
      getSelectedFormat,
      generateProductId,
      getPrice,
      isIngredientModalOpen,
      addItem,
    ]
  );

  const handleIncreaseQuantity = useCallback(
    (item: MenuItem) => {
      const formato = hasMultipleFormats(item) ? getSelectedFormat(item) : null;
      const id = generateProductId(item, formato);
      const currentQty = getItemQuantity(id);

      if (currentQty === 0) {
        const price = getPrice(item, formato);
        let productName = item.nome;
        if (formato) productName = `${item.nome} (${formato})`;
        addItem({ id, nome: productName, prezzo: price }, 1);
      } else {
        updateQuantity(id, currentQty + 1);
      }
    },
    [hasMultipleFormats, getSelectedFormat, generateProductId, getItemQuantity, getPrice, addItem, updateQuantity]
  );

  const handleDecreaseQuantity = useCallback(
    (item: MenuItem) => {
      const formato = hasMultipleFormats(item) ? getSelectedFormat(item) : null;
      const id = generateProductId(item, formato);
      const currentQty = getItemQuantity(id);
      if (currentQty > 0) {
        updateQuantity(id, currentQty - 1);
      }
    },
    [hasMultipleFormats, getSelectedFormat, generateProductId, getItemQuantity, updateQuantity]
  );

  return {
    selectedFormats,
    isIngredientModalOpen,
    setIsIngredientModalOpen,
    selectedProduct,
    setSelectedProduct,
    selectedExtras,
    setSelectedExtras,
    generateProductBaseId,
    generateProductId,
    hasMultipleFormats,
    getAvailableFormats,
    getSelectedFormat,
    setSelectedFormat,
    getPrice,
    getCurrentFormatQuantity,
    getQuantities,
    handleOpenIngredientModal,
    handleToggleExtra,
    handleAddToOrder,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
  };
};
