import { useOrder } from "../../../context/OrderContext";
import { OrderBadge } from "./OrderBadge.client";
import { OrderPanel } from "./OrderPanel.client";

export const OrderManager = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearOrder,
    totalItems,
    isPanelOpen,
    setIsPanelOpen,
    setEditRequest,
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
        onEditItem={(item) => {
          setEditRequest(item);
          setIsPanelOpen(false);
        }}
      />
    </>
  );
};
