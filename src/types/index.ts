import type { ComponentType, SVGProps } from "react";

export interface OrderItem {
  id: string;
  nome: string;
  prezzo: number;
  quantita: number;
}

export interface OrderContextType {
  items: OrderItem[];
  note: string;
  addItem: (product: Pick<OrderItem, "id" | "nome" | "prezzo">, quantity?: number) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  removeItem: (productId: string) => void;
  clearOrder: () => void;
  getItemQuantity: (productId: string) => number;
  updateNote: (newNote: string) => void;
  totalItems: number;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
}

export interface MenuItemVariante {
  tipo: string;
  sovrapprezzo: number;
}

export interface MenuItem {
  nome: string;
  ingredienti?: string;
  prezzo?: number | string;
  prezzi?: Record<string, number | string>;
  allergeni?: number[];
  personalizzabile?: boolean;
  ingredienti_removibili?: string[];
  tipo?: string;
  scelta?: MenuItem[];
  varianti?: MenuItemVariante[];
  quantita?: string;
  formato?: string;
  selectedExtras?: Ingrediente[];
}

export interface Allergene {
  id: number;
  nome: string;
  dettaglio: string;
}

export interface AllergeniData {
  titolo: string;
  descrizione: string;
  allergeni: Allergene[];
}

export interface Ingrediente {
  ingrediente: string;
  prezzo: number;
}

export type AllergeniIconsMap = Record<number, ComponentType<SVGProps<SVGSVGElement>>>;
