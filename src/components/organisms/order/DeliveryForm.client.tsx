import { Input, Switch, Select } from "../../atoms";
import { COMUNI_CONSEGNA } from "../../../hooks/useOrderForm";
import styles from "../../../style/OrderPanel.module.css";

import type { useOrderForm, PaymentMethod } from "../../../hooks/useOrderForm";

type OrderFormReturn = ReturnType<typeof useOrderForm>;

interface DeliveryFormProps {
  form: OrderFormReturn;
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "contanti", label: "Contanti" },
  { value: "carta", label: "Carta" },
];

export const DeliveryForm = ({ form }: DeliveryFormProps) => {
  return (
    <>
      <div className={styles.deliveryToggle}>
        <span className={styles.deliveryToggleLabel}>Vuoi la consegna a domicilio?</span>
        <Switch checked={form.deliverySelected} onChange={form.handleDeliveryToggle} />
      </div>

      {form.deliverySelected && (
        <div className={styles.deliveryFields}>
          <Input
            placeholder="Indirizzo di consegna"
            value={form.address}
            error={!!form.addressError}
            onChange={(e) => {
              form.setAddress(e.target.value);
              if (e.target.value.trim() !== "") form.setAddressError("");
            }}
          />
          {form.addressError && <div className={styles.fieldError}>{form.addressError}</div>}

          <Input
            placeholder="Numero civico"
            value={form.civicNumber}
            error={!!form.civicError}
            onChange={(e) => {
              form.setCivicNumber(e.target.value);
              if (e.target.value.trim() !== "") form.setCivicError("");
            }}
          />
          {form.civicError && <div className={styles.fieldError}>{form.civicError}</div>}

          <Input
            placeholder="Nome sul citofono"
            value={form.intercom}
            error={!!form.intercomError}
            onChange={(e) => {
              form.setIntercom(e.target.value);
              if (e.target.value.trim() !== "") form.setIntercomError("");
            }}
          />
          {form.intercomError && <div className={styles.fieldError}>{form.intercomError}</div>}

          <Select
            placeholder="Seleziona il comune"
            value={form.comune}
            error={!!form.comuneError}
            onChange={(value) => {
              form.setComune(value);
              if (value) form.setComuneError("");
            }}
            options={COMUNI_CONSEGNA.map((c) => ({
              value: c.nome,
              label: `${c.nome} (+€${c.sovrapprezzo},00)`,
            }))}
          />
          {form.comuneError && <div className={styles.fieldError}>{form.comuneError}</div>}

          <div className={styles.paymentMethodSection}>
            <span className={styles.paymentMethodLabel}>Metodo di pagamento:</span>
            <div className={styles.paymentMethodButtons}>
              {PAYMENT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.paymentMethodBtn} ${form.paymentMethod === value ? styles.paymentMethodBtnActive : ""}`}
                  onClick={() => {
                    form.setPaymentMethod(value);
                    form.setPaymentError("");
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {form.paymentError && <div className={styles.fieldError}>{form.paymentError}</div>}
        </div>
      )}
    </>
  );
};
