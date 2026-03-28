import type { Order, OrderItem } from "../types";

const W = 48;
const SEP = "─".repeat(W);
const DSEP = "═".repeat(W);

const padPrice = (label: string, price: string): string => {
  const gap = W - label.length - price.length;
  return gap > 0 ? label + " ".repeat(gap) + price : `${label} ${price}`;
};

const eur = (n: number): string => `EUR ${n.toFixed(2)}`;

const formatItemLabel = (item: OrderItem): string => {
  const c = item.customization;
  if (c?.menuScelta) {
    return `${item.quantita}x Menu ${c.menuScelta}`;
  }
  return `${item.quantita}x ${item.nome}`;
};

const formatItemDetails = (item: OrderItem): string[] => {
  const lines: string[] = [];
  const c = item.customization;
  if (!c) return lines;

  if (c.variante) lines.push(` (${c.variante})`);
  if (c.extras?.length > 0) {
    for (const e of c.extras) {
      lines.push(` + ${e.ingrediente}`);
    }
  }
  if (c.removedIngredients?.length > 0) {
    if (c.extras?.length > 0) lines.push("");
    for (const r of c.removedIngredients) {
      lines.push(` - ${r}`);
    }
  }
  if (c.opzioniSpeciali?.length > 0) {
    for (const o of c.opzioniSpeciali) {
      lines.push(` ${o}`);
    }
  }
  if (c.menuBevanda) lines.push(` Bevanda: ${c.menuBevanda}`);

  return lines;
};

const isBevanda = (item: OrderItem): boolean => item.id.startsWith("bevande_");

const splitItems = (items: OrderItem[]): { food: OrderItem[]; drinks: OrderItem[] } => {
  const food: OrderItem[] = [];
  const drinks: OrderItem[] = [];
  for (const item of items) {
    (isBevanda(item) ? drinks : food).push(item);
  }
  return { food, drinks };
};

const buildMapsUrl = (order: Order): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.address} ${order.civic_number}, ${order.comune}`)}`;

// ─── Printer commands (Epson ePOS) ─────────────────────────

export const formatReceipt = (printer: epson.ePOSPrint, order: Order): void => {
  const date = new Date(order.created_at);
  const dateStr = date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

  // Header
  printer.addTextAlign(printer.ALIGN_CENTER);
  printer.addTextSize(2, 2);
  printer.addText("LA TEGLIA\n");
  printer.addTextSize(1, 1);
  printer.addText(DSEP + "\n");

  // Data
  printer.addText(`${dateStr}\n`);
  printer.addFeedLine(1);

  // Orario richiesto — label + orario grande
  printer.addTextSize(1, 1);
  printer.addText("Orario richiesto:\n");
  printer.addTextSize(3, 3);
  printer.addTextStyle(false, false, true, printer.COLOR_1);
  printer.addText(`${order.time_slot}\n`);
  printer.addTextSize(1, 1);
  printer.addTextStyle(false, false, false, printer.COLOR_1);
  printer.addFeedLine(1);
  printer.addText(DSEP + "\n");

  // Orario ricezione
  printer.addTextAlign(printer.ALIGN_LEFT);
  printer.addText(`Ordine ricevuto alle: ${timeStr}\n`);
  printer.addText(SEP + "\n");

  const { food: foodItems, drinks: drinkItems } = splitItems(order.items);

  // Prodotti — nome 1.5x con prezzo, dettagli sotto
  for (const item of foodItems) {
    const label = formatItemLabel(item);
    const price = typeof item.prezzo === "number" ? item.prezzo : parseFloat(String(item.prezzo)) || 0;
    const priceStr = eur(price * item.quantita);

    printer.addFeedLine(1);

    // Nome prodotto — leggermente ingrandito e bold (width 2, height 1)
    printer.addTextSize(2, 1);
    printer.addTextStyle(false, false, true, printer.COLOR_1);
    printer.addText(`${label}\n`);
    printer.addTextStyle(false, false, false, printer.COLOR_1);
    printer.addTextSize(1, 1);

    // Prezzo — allineato a destra, font normale
    printer.addTextAlign(printer.ALIGN_RIGHT);
    printer.addText(`${priceStr}\n`);
    printer.addTextAlign(printer.ALIGN_LEFT);

    // Dettagli — subito sotto, font normale
    for (const detail of formatItemDetails(item)) {
      printer.addText(`${detail}\n`);
    }

    // Separatore tra prodotti
    printer.addText(SEP + "\n");
  }

  // Bevande raggruppate
  if (drinkItems.length > 0) {
    printer.addFeedLine(1);
    printer.addTextStyle(false, false, true, printer.COLOR_1);
    printer.addText("BEVANDE\n");
    printer.addTextStyle(false, false, false, printer.COLOR_1);
    printer.addText(SEP + "\n");
    for (const item of drinkItems) {
      const label = formatItemLabel(item);
      const price = typeof item.prezzo === "number" ? item.prezzo : parseFloat(String(item.prezzo)) || 0;
      const priceStr = eur(price * item.quantita);
      printer.addText(padPrice(label, priceStr) + "\n");
    }
    printer.addText(SEP + "\n");
  }

  // Totali (no per-item recap, solo subtotale/consegna/totale)
  printer.addFeedLine(1);
  printer.addText(padPrice("Subtotale:", eur(order.subtotal)) + "\n");
  if (order.delivery_fee > 0) {
    printer.addText(padPrice("Consegna:", eur(order.delivery_fee)) + "\n");
  }
  printer.addText(SEP + "\n");
  printer.addTextStyle(false, false, true, printer.COLOR_1);
  printer.addTextSize(1, 2);
  printer.addText(padPrice("TOTALE:", eur(order.total)) + "\n");
  printer.addTextSize(1, 1);
  printer.addTextStyle(false, false, false, printer.COLOR_1);
  printer.addText(DSEP + "\n");

  // Dati consegna / ritiro — font leggermente più grande
  printer.addFeedLine(1);
  printer.addTextSize(1, 2);

  if (order.is_delivery) {
    printer.addTextStyle(false, false, true, printer.COLOR_1);
    printer.addText("CONSEGNA A DOMICILIO\n");
    printer.addTextStyle(false, false, false, printer.COLOR_1);
    printer.addFeedLine(1);
    printer.addText(`${order.address} ${order.civic_number}\n`);
    if (order.comune) printer.addText(`${order.comune}\n`);
    if (order.intercom) printer.addText(`Citofono: ${order.intercom}\n`);
    printer.addText(`Tel: ${order.phone}\n`);
    if (order.payment) printer.addText(`Pagamento: ${order.payment === "carta" ? "Carta" : "Contanti"}\n`);

    // QR Code Google Maps
    printer.addTextSize(1, 1);
    printer.addFeedLine(1);
    printer.addTextAlign(printer.ALIGN_CENTER);
    printer.addSymbol(
      buildMapsUrl(order),
      printer.SYMBOL_QRCODE_MODEL_2,
      printer.LEVEL_DEFAULT,
      6,
      6,
      0,
    );
    printer.addFeedLine(1);
    printer.addText("Inquadra per aprire Google Maps\n");
    printer.addTextAlign(printer.ALIGN_LEFT);
  } else {
    printer.addTextStyle(false, false, true, printer.COLOR_1);
    printer.addText("RITIRO IN PIZZERIA\n");
    printer.addTextStyle(false, false, false, printer.COLOR_1);
    printer.addText(`Tel: ${order.phone}\n`);
  }

  printer.addTextSize(1, 1);
  printer.addText(DSEP + "\n");
  printer.addFeedLine(3);
  printer.addCut(printer.CUT_FEED);
};
