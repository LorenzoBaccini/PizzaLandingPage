import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

import type { ReactNode } from "react";

import type { OrderItem, OrderContextType, OrderItemCustomization, MenuItem } from "../types";

const STORAGE_KEY = "pizzeria_mio_ordine";

type AddItemProduct = Pick<OrderItem, "id" | "nome" | "prezzo"> & {
  customization?: OrderItemCustomization;
  sourceProduct?: Partial<MenuItem>;
};

const OrderContext = createContext<OrderContextType | null>(null);

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider = ({ children }: OrderProviderProps) => {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editRequest, setEditRequest] = useState<OrderItem | null>(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setItems(parsed.items || []);
      }
    } catch {
      // Silently ignore corrupted localStorage
    }
  }, []);

  useEffect(() => {
    const data = {
      items,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [items]);

  const addItem = useCallback(
    (product: AddItemProduct, quantity = 1) => {
      setItems((currentItems) => {
        const existing = currentItems.find((item) => item.id === product.id);
        if (existing) {
          return currentItems.map((item) =>
            item.id === product.id
              ? { ...item, quantita: Math.min(item.quantita + quantity, 20) }
              : item
          );
        }
        return [
          ...currentItems,
          {
            id: product.id,
            nome: product.nome,
            prezzo: product.prezzo,
            quantita: quantity,
            customization: product.customization,
            sourceProduct: product.sourceProduct,
          },
        ];
      });
    },
    []
  );

  const replaceItem = useCallback(
    (oldId: string, newItem: AddItemProduct) => {
      setItems((currentItems) => {
        if (oldId === newItem.id) {
          return currentItems.map((item) =>
            item.id === oldId
              ? {
                  ...item,
                  nome: newItem.nome,
                  prezzo: newItem.prezzo,
                  customization: newItem.customization,
                  sourceProduct: newItem.sourceProduct,
                }
              : item
          );
        }

        const existingTarget = currentItems.find(
          (item) => item.id === newItem.id && item.id !== oldId
        );
        const oldItem = currentItems.find((item) => item.id === oldId);
        const oldQuantity = oldItem?.quantita ?? 1;

        if (existingTarget) {
          return currentItems
            .filter((item) => item.id !== oldId)
            .map((item) =>
              item.id === newItem.id
                ? { ...item, quantita: Math.min(item.quantita + oldQuantity, 20) }
                : item
            );
        }

        return currentItems.map((item) =>
          item.id === oldId
            ? {
                id: newItem.id,
                nome: newItem.nome,
                prezzo: newItem.prezzo,
                quantita: oldQuantity,
                customization: newItem.customization,
                sourceProduct: newItem.sourceProduct,
              }
            : item
        );
      });
    },
    []
  );

  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantita: Math.min(newQuantity, 20) } : item
        )
      );
    }
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const clearOrder = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback(
    (productId: string): number => {
      const item = items.find((i) => i.id === productId);
      return item ? item.quantita : 0;
    },
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantita, 0),
    [items]
  );

  const value = useMemo<OrderContextType>(
    () => ({
      items,
      addItem,
      replaceItem,
      updateQuantity,
      removeItem,
      clearOrder,
      getItemQuantity,
      totalItems,
      isPanelOpen,
      setIsPanelOpen,
      editRequest,
      setEditRequest,
    }),
    [
      items,
      addItem,
      replaceItem,
      updateQuantity,
      removeItem,
      clearOrder,
      getItemQuantity,
      totalItems,
      isPanelOpen,
      editRequest,
    ]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};
