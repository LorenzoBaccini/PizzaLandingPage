import type { ComponentType, SVGProps } from "react";

export interface OrderItemCustomization {
  extras: Ingrediente[];
  removedIngredients: string[];
  variante: string | null;
  menuScelta: string | null;
  menuBevanda: string | null;
  opzioniSpeciali: string[];
}

export interface OrderItem {
  id: string;
  nome: string;
  prezzo: number;
  quantita: number;
  customization?: OrderItemCustomization;
  sourceProduct?: Partial<MenuItem>;
}

export interface OrderContextType {
  items: OrderItem[];
  addItem: (product: Pick<OrderItem, "id" | "nome" | "prezzo"> & { customization?: OrderItemCustomization; sourceProduct?: Partial<MenuItem> }, quantity?: number) => void;
  replaceItem: (oldId: string, newItem: Pick<OrderItem, "id" | "nome" | "prezzo"> & { customization?: OrderItemCustomization; sourceProduct?: Partial<MenuItem> }) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  removeItem: (productId: string) => void;
  clearOrder: () => void;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
  editRequest: OrderItem | null;
  setEditRequest: (item: OrderItem | null) => void;
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
  bevandaFissa?: string;
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

export type OrderStatus = "pending" | "printed" | "done";

export interface Order {
  id: string;
  created_at: string;
  items: OrderItem[];
  is_delivery: boolean;
  phone: string;
  address: string | null;
  civic_number: string | null;
  intercom: string | null;
  comune: string | null;
  payment: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  time_slot: string;
  status: OrderStatus;
}
