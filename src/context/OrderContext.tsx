import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

import type { ReactNode } from "react";

import type { OrderItem, OrderContextType } from "../types";

const STORAGE_KEY = "pizzeria_mio_ordine";

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
  const [note, setNote] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setItems(parsed.items || []);
        setNote(parsed.note || "");
      }
    } catch {
      // Silently ignore corrupted localStorage
    }
  }, []);

  useEffect(() => {
    const data = {
      items,
      note,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [items, note]);

  const addItem = useCallback(
    (product: Pick<OrderItem, "id" | "nome" | "prezzo">, quantity = 1) => {
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
          },
        ];
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
    setNote("");
  }, []);

  const getItemQuantity = useCallback(
    (productId: string): number => {
      const item = items.find((i) => i.id === productId);
      return item ? item.quantita : 0;
    },
    [items]
  );

  const updateNote = useCallback((newNote: string) => {
    setNote(newNote);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantita, 0),
    [items]
  );

  const value = useMemo<OrderContextType>(
    () => ({
      items,
      note,
      addItem,
      updateQuantity,
      removeItem,
      clearOrder,
      getItemQuantity,
      updateNote,
      totalItems,
      isPanelOpen,
      setIsPanelOpen,
    }),
    [
      items,
      note,
      addItem,
      updateQuantity,
      removeItem,
      clearOrder,
      getItemQuantity,
      updateNote,
      totalItems,
      isPanelOpen,
    ]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};
