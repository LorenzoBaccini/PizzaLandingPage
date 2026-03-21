import { Input, Switch, Select } from "../../atoms";
import { COMUNI_CONSEGNA } from "../../../hooks/useOrderForm";
import styles from "../../../style/OrderPanel.module.css";

import type { useOrderForm } from "../../../hooks/useOrderForm";

type OrderFormReturn = ReturnType<typeof useOrderForm>;

interface DeliveryFormProps {
  form: OrderFormReturn;
}

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
        </div>
      )}
    </>
  );
};
