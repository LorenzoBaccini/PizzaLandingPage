export const BUSINESS_HOURS = {
  weekday: {
    morning: { open: "11:00", close: "15:00" },
    evening: { open: "17:30", close: "00:00" },
  },
  sunday: {
    evening: { open: "18:00", close: "00:00" },
  },
} as const;

export const ORDER_SLOTS = {
  weekday: {
    morning: { start: 12, end: 15 },
    evening: { start: 18, end: 22 },
  },
  sunday: {
    evening: { start: 18, end: 22 },
  },
} as const;

export const HOURS_DISPLAY = [
  "Sempre aperti",
  "Tutti i giorni anche i festivi",
  `${BUSINESS_HOURS.weekday.morning.open} alle ${BUSINESS_HOURS.weekday.morning.close}`,
  `${BUSINESS_HOURS.weekday.evening.open} alle ${BUSINESS_HOURS.weekday.evening.close}`,
  "Chiuso Domenica mattina",
] as const;
