import { useState, useEffect, useCallback, useRef, useMemo } from "react";

import dayjs from "dayjs";
import "dayjs/locale/it";

import { supabase } from "../../lib/supabase";
import { usePrinter, getPrinterIp, setPrinterIp } from "../../hooks/usePrinter";
import styles from "../../style/OrdersPanel.module.css";

import type { Order, OrderStatus } from "../../types";

const AUTO_REFRESH_MS = 15_000;
const DAYS_TO_FETCH = 3;

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Da stampare",
  printed: "Stampato",
  done: "Consegnato",
};

const STATUS_CSS: Record<OrderStatus, string> = {
  pending: styles.badgePending,
  printed: styles.badgePrinted,
  done: styles.badgeDone,
};

export const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [ip, setIp] = useState(getPrinterIp);
  const printer = usePrinter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = useCallback(async () => {
    const since = dayjs().subtract(DAYS_TO_FETCH - 1, "day").format("YYYY-MM-DD");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", `${since}T00:00:00`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const sorted = (data as Order[]).sort((a, b) => a.time_slot.localeCompare(b.time_slot));
      setOrders(sorted);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, AUTO_REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchOrders]);

  const handleIpSave = (value: string) => {
    setIp(value);
    setPrinterIp(value);
  };

  const handlePrint = async (order: Order) => {
    printer.print(order);

    await supabase
      .from("orders")
      .update({ status: "printed" })
      .eq("id", order.id);

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: "printed" as OrderStatus } : o)),
    );
  };

  const handleMarkDone = async (order: Order) => {
    await supabase
      .from("orders")
      .update({ status: "done" })
      .eq("id", order.id);

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: "done" as OrderStatus } : o)),
    );
  };

  const availableDates = useMemo(() => {
    const dateSet = new Set<string>();
    for (const order of orders) {
      dateSet.add(dayjs(order.created_at).format("YYYY-MM-DD"));
    }
    return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  }, [orders]);

  const dateLabel = (dateKey: string): string => {
    const today = dayjs().format("YYYY-MM-DD");
    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    if (dateKey === today) return "Oggi";
    if (dateKey === yesterday) return "Ieri";
    return dayjs(dateKey).locale("it").format("ddd D MMM");
  };

  const groupedOrders = useMemo(() => {
    const filtered = filterDate
      ? orders.filter((o) => dayjs(o.created_at).format("YYYY-MM-DD") === filterDate)
      : orders;

    const map = new Map<string, Order[]>();
    for (const order of filtered) {
      const dateKey = dayjs(order.created_at).format("YYYY-MM-DD");
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(order);
    }

    const groups: { date: string; label: string; orders: Order[] }[] = [];
    for (const [dateKey, dateOrders] of map) {
      groups.push({ date: dateKey, label: dateLabel(dateKey), orders: dateOrders });
    }

    groups.sort((a, b) => b.date.localeCompare(a.date));
    return groups;
  }, [orders, filterDate]);

  return (
    <>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <span className={styles.orderCount}>
          {orders.length} ordini
        </span>
        <div className={styles.toolbarActions}>
          <button className={styles.btnRefresh} onClick={fetchOrders}>
            Aggiorna
          </button>
          <button
            className={styles.btnGear}
            onClick={() => setShowSettings(true)}
            aria-label="Impostazioni stampante"
          >
            &#9881;
          </button>
        </div>
      </div>

      {/* Date filter */}
      {availableDates.length > 1 && (
        <div className={styles.dateFilter}>
          <button
            className={`${styles.dateChip} ${filterDate === null ? styles.dateChipActive : ""}`}
            onClick={() => setFilterDate(null)}
          >
            Tutti
          </button>
          {availableDates.map((d) => (
            <button
              key={d}
              className={`${styles.dateChip} ${filterDate === d ? styles.dateChipActive : ""}`}
              onClick={() => setFilterDate(filterDate === d ? null : d)}
            >
              {dateLabel(d)}
            </button>
          ))}
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div className={styles.settingsOverlay} onClick={() => setShowSettings(false)}>
          <div className={styles.settingsModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.settingsTitle}>Impostazioni Stampante</h3>
            <label className={styles.settingsLabel}>Indirizzo IP</label>
            <input
              type="text"
              className={styles.settingsInput}
              placeholder="192.168.1.100"
              value={ip}
              onChange={(e) => handleIpSave(e.target.value)}
            />
            <button className={styles.settingsClose} onClick={() => setShowSettings(false)}>
              Chiudi
            </button>
          </div>
        </div>
      )}

      {loading && <p className={styles.loadingText}>Caricamento ordini...</p>}

      {!loading && orders.length === 0 && (
        <div className={styles.emptyState}>Nessun ordine</div>
      )}

      {!loading && groupedOrders.map((group) => (
        <div key={group.date} className={styles.dayGroup}>
          <h2 className={styles.dayGroupTitle}>
            {group.label}
            <span className={styles.dayGroupCount}>{group.orders.length} ordini</span>
          </h2>
          <div className={styles.orderList}>
            {group.orders.map((order) => {
              const isOpen = expandedId === order.id;
              const itemCount = order.items.reduce((s, i) => s + i.quantita, 0);

              return (
                <div key={order.id} className={styles.orderCard}>
                  {/* Accordion header */}
                  <button
                    className={styles.accordionHeader}
                    onClick={() => setExpandedId(isOpen ? null : order.id)}
                  >
                    <span className={styles.orderSlotTime}>{order.time_slot}</span>
                    <span className={styles.accordionSummary}>
                      {order.is_delivery ? "Consegna" : "Ritiro"} &middot; {itemCount} {itemCount === 1 ? "prodotto" : "prodotti"} &middot; &euro;{Number(order.total).toFixed(2)}
                    </span>
                    <span className={`${styles.badge} ${STATUS_CSS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span className={`${styles.accordionArrow} ${isOpen ? styles.accordionArrowOpen : ""}`}>&#9660;</span>
                  </button>

                  {/* Accordion body */}
                  {isOpen && (
                    <div className={styles.accordionBody}>
                      <span className={styles.orderCreatedAt}>
                        Ricevuto alle {dayjs(order.created_at).format("HH:mm")}
                      </span>

                      {/* Indirizzo */}
                      <div className={styles.orderAddress}>
                        {order.is_delivery ? (
                          <div className={styles.addressRow}>
                            <div className={styles.addressInfo}>
                              <span className={styles.addressLine}>
                                {order.address} {order.civic_number}
                              </span>
                              <span className={styles.addressComune}>{order.comune}</span>
                              {order.intercom && (
                                <span className={styles.addressDetail}>Citofono: {order.intercom}</span>
                              )}
                              {order.phone && (
                                <span className={styles.addressDetail}>Tel: {order.phone}</span>
                              )}
                              {order.payment && (
                                <span className={styles.addressDetail}>
                                  Pag: {order.payment === "carta" ? "Carta" : "Contanti"}
                                </span>
                              )}
                            </div>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.address} ${order.civic_number}, ${order.comune}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.qrLink}
                            >
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.address} ${order.civic_number}, ${order.comune}`)}`)}`}
                                alt="QR Maps"
                                className={styles.qrCode}
                                width={80}
                                height={80}
                              />
                            </a>
                          </div>
                        ) : (
                          <>
                            <span className={styles.addressLine}>Ritiro in pizzeria</span>
                            {order.phone && (
                              <span className={styles.addressDetail}>Tel: {order.phone}</span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Prodotti */}
                      <div className={styles.orderItems}>
                        {order.items.map((item, idx) => {
                          const c = item.customization;
                          const label = c?.menuScelta
                            ? `Menu ${c.menuScelta}`
                            : item.nome;
                          return (
                            <div key={idx} className={styles.itemBlock}>
                              <div className={styles.itemRow}>
                                <span className={styles.itemQty}>{item.quantita}x</span>
                                <span className={styles.itemName}>{label}</span>
                                <span className={styles.itemPrice}>
                                  &euro;{(
                                    (typeof item.prezzo === "number" ? item.prezzo : parseFloat(String(item.prezzo)) || 0) *
                                    item.quantita
                                  ).toFixed(2)}
                                </span>
                              </div>
                              {c && (
                                <div className={styles.itemDetails}>
                                  {c.variante && <span>Formato: {c.variante}</span>}
                                  {c.extras?.map((e) => (
                                    <span key={e.ingrediente} className={styles.detailAdd}>+ {e.ingrediente}</span>
                                  ))}
                                  {c.removedIngredients?.map((r) => (
                                    <span key={r} className={styles.detailRemove}>- {r}</span>
                                  ))}
                                  {c.opzioniSpeciali?.map((o) => (
                                    <span key={o}>{o}</span>
                                  ))}
                                  {c.menuBevanda && <span>Bevanda: {c.menuBevanda}</span>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Totale */}
                      <div className={styles.orderTotalRow}>
                        <span className={styles.orderTotal}>&euro;{Number(order.total).toFixed(2)}</span>
                      </div>

                      {/* Azioni */}
                      <div className={styles.orderActions}>
                        <button
                          className={styles.btnPrint}
                          onClick={() => handlePrint(order)}
                          disabled={printer.status === "connecting" || printer.status === "printing"}
                        >
                          {printer.printingOrderId === order.id && printer.status === "connecting"
                            ? "Connessione..."
                            : printer.printingOrderId === order.id && printer.status === "printing"
                              ? "Stampa..."
                              : "Stampa"}
                        </button>
                        {order.status !== "done" && (
                          <button className={styles.btnDone} onClick={() => handleMarkDone(order)}>
                            Consegnato
                          </button>
                        )}
                      </div>

                      {printer.printingOrderId === order.id && printer.status === "success" && (
                        <p className={`${styles.printStatus} ${styles.statusSuccess}`}>Stampato con successo</p>
                      )}
                      {printer.printingOrderId === order.id && printer.status === "error" && (
                        <p className={`${styles.printStatus} ${styles.statusError}`}>{printer.errorMessage}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
};
