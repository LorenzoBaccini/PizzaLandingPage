import { useState, useCallback, useMemo } from "react";

import { useOrder } from "../context/OrderContext";
import { ingredienti } from "../data/ingredienti.json";

import type { MenuItem, Ingrediente, OrderItemCustomization, OrderItem } from "../types";

const SPECIAL_OPTIONS_PRICES: Record<string, number> = {
  "Impasto integrale": 1.00,
  "Mozzarella senza lattosio": 1.50,
};

export const buildCustomizationId = (
  baseId: string,
  customization?: OrderItemCustomization
): string => {
  if (!customization) return baseId;

  const parts: string[] = [baseId];

  const sortedExtras = [...customization.extras]
    .map((e) => e.ingrediente.toLowerCase())
    .sort();
  if (sortedExtras.length > 0) {
    parts.push(`__x_${sortedExtras.join(",")}`);
  }

  const sortedRemoved = [...customization.removedIngredients].sort();
  if (sortedRemoved.length > 0) {
    parts.push(`__nr_${sortedRemoved.map((r) => r.toLowerCase()).join(",")}`);
  }

  if (customization.variante) {
    parts.push(`__v_${customization.variante.toLowerCase()}`);
  }

  if (customization.menuScelta) {
    parts.push(`__ms_${customization.menuScelta.toLowerCase().replace(/\s+/g, "_")}`);
  }

  if (customization.menuBevanda) {
    parts.push(`__mb_${customization.menuBevanda.toLowerCase().replace(/\s+/g, "_")}`);
  }

  const sortedSpecial = [...(customization.opzioniSpeciali || [])].sort();
  if (sortedSpecial.length > 0) {
    parts.push(`__sp_${sortedSpecial.map((s) => s.toLowerCase().replace(/\s+/g, "_")).join(",")}`);
  }

  return parts.join("");
};

export const useMenuLogic = (activeSection: string) => {
  const { addItem, replaceItem, getItemQuantity, updateQuantity } = useOrder();

  const [selectedFormats, setSelectedFormats] = useState<Record<string, string>>({});
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Ingrediente[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [initialCustomization, setInitialCustomization] = useState<OrderItemCustomization | undefined>(undefined);

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
      setEditingItemId(null);
      setInitialCustomization(undefined);
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
    (item: MenuItem, customization?: OrderItemCustomization) => {
      const formato = hasMultipleFormats(item)
        ? getSelectedFormat(item)
        : null;

      const baseProductId = generateProductId(item, formato);
      const productId = buildCustomizationId(baseProductId, customization);

      let basePrice = getPrice(item, formato);

      if (customization) {
        const extrasTotal = customization.extras.reduce((sum, e) => sum + e.prezzo, 0);
        basePrice += extrasTotal;

        if (customization.variante) {
          const varianteObj = item.varianti?.find((v) => v.tipo === customization.variante);
          if (varianteObj) {
            basePrice += varianteObj.sovrapprezzo;
          }
        }

        if (customization.opzioniSpeciali) {
          const specialTotal = customization.opzioniSpeciali.reduce(
            (sum, opt) => sum + (SPECIAL_OPTIONS_PRICES[opt] ?? 0),
            0
          );
          basePrice += specialTotal;
        }
      }

      const isMenu = !!item.scelta || item.tipo === "menu_scelta";
      let productName = isMenu ? `Menu - ${item.nome}` : item.nome;
      if (formato) {
        productName = isMenu ? `Menu - ${item.nome} (${formato})` : `${item.nome} (${formato})`;
      }

      const sourceProduct: Partial<MenuItem> = {
        nome: item.nome,
        ingredienti: item.ingredienti,
        prezzo: item.prezzo,
        prezzi: item.prezzi,
        personalizzabile: item.personalizzabile,
        ingredienti_removibili: item.ingredienti_removibili,
        tipo: item.tipo,
        scelta: item.scelta,
        varianti: item.varianti,
        formato: item.formato,
      };

      const product = {
        id: productId,
        nome: productName,
        prezzo: basePrice,
        customization,
        sourceProduct,
      };

      if (isIngredientModalOpen) {
        setIsIngredientModalOpen(false);
        setSelectedProduct(null);
        setSelectedExtras([]);
      }

      if (editingItemId) {
        replaceItem(editingItemId, product);
        setEditingItemId(null);
        setInitialCustomization(undefined);
      } else {
        addItem(product, 1);
      }
    },
    [
      hasMultipleFormats,
      getSelectedFormat,
      generateProductId,
      getPrice,
      isIngredientModalOpen,
      editingItemId,
      addItem,
      replaceItem,
    ]
  );

  const handleEditFromCart = useCallback(
    (orderItem: OrderItem) => {
      if (!orderItem.sourceProduct) return;

      const source = orderItem.sourceProduct as MenuItem;
      const enriched: MenuItem = {
        ...source,
        selectedExtras: orderItem.customization?.extras ?? [],
      };

      setSelectedProduct(enriched);
      setSelectedExtras(orderItem.customization?.extras ?? []);
      setEditingItemId(orderItem.id);
      setInitialCustomization(
        orderItem.customization
          ? { ...orderItem.customization, opzioniSpeciali: orderItem.customization.opzioniSpeciali ?? [] }
          : undefined
      );
      setIsIngredientModalOpen(true);
    },
    []
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
    initialCustomization,
    editingItemId,
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
    handleEditFromCart,
  };
};
