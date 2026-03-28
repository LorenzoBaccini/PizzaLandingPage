import { supabase } from "./supabase";

import type { OrderItem } from "../types";

interface SaveOrderPayload {
  items: OrderItem[];
  isDelivery: boolean;
  phone: string;
  address?: string;
  civicNumber?: string;
  intercom?: string;
  comune?: string;
  payment?: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  timeSlot: string;
}

export const saveOrder = (payload: SaveOrderPayload): void => {
  supabase
    .from("orders")
    .insert({
      items: payload.items,
      is_delivery: payload.isDelivery,
      phone: payload.phone,
      address: payload.address ?? null,
      civic_number: payload.civicNumber ?? null,
      intercom: payload.intercom ?? null,
      comune: payload.comune ?? null,
      payment: payload.payment ?? null,
      subtotal: payload.subtotal,
      delivery_fee: payload.deliveryFee,
      total: payload.total,
      time_slot: payload.timeSlot,
    })
    .then(({ error }) => {
      if (error) console.error("[orders] save failed:", error.message);
    });
};
