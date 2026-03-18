import { useOrder } from "../../../context/OrderContext";
import { OrderBadge } from "./OrderBadge.client";
import { OrderPanel } from "./OrderPanel.client";

export const OrderManager = () => {
  const {
    items,
    note,
    updateQuantity,
    removeItem,
    clearOrder,
    updateNote,
    totalItems,
    isPanelOpen,
    setIsPanelOpen,
  } = useOrder();

  return (
    <>
      <OrderBadge onClick={() => setIsPanelOpen(true)} totalItems={totalItems} />

      <OrderPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearOrder={clearOrder}
        note={note}
        onUpdateNote={updateNote}
      />
    </>
  );
};
