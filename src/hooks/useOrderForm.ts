import { useState } from "react";

export const COMUNI_CONSEGNA = [
  { nome: "Desio", sovrapprezzo: 1 },
  { nome: "Seregno", sovrapprezzo: 2 },
  { nome: "Lissone", sovrapprezzo: 2 },
  { nome: "Cesano Maderno", sovrapprezzo: 2 },
  { nome: "Muggiò", sovrapprezzo: 2 },
  { nome: "Nova Milanese", sovrapprezzo: 2 },
  { nome: "Bovisio-Masciago", sovrapprezzo: 2 },
  { nome: "Varedo", sovrapprezzo: 2 },
  { nome: "Meda", sovrapprezzo: 2 },
] as const;

export const useOrderForm = () => {
  const [deliverySelected, setDeliverySelected] = useState(false);
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [civicNumber, setCivicNumber] = useState("");
  const [civicError, setCivicError] = useState("");
  const [intercom, setIntercom] = useState("");
  const [intercomError, setIntercomError] = useState("");
  const [comune, setComune] = useState<string | null>(null);
  const [comuneError, setComuneError] = useState("");

  const handleDeliveryToggle = (checked: boolean) => {
    setDeliverySelected(checked);
    if (!checked) {
      setAddressError("");
      setCivicError("");
      setIntercomError("");
      setComuneError("");
    }
  };

  const validateDelivery = (): boolean => {
    let hasError = false;

    if (address.trim() === "") {
      setAddressError("Inserisci l'indirizzo di consegna");
      hasError = true;
    } else {
      setAddressError("");
    }
    if (civicNumber.trim() === "") {
      setCivicError("Inserisci il numero civico");
      hasError = true;
    } else {
      setCivicError("");
    }
    if (intercom.trim() === "") {
      setIntercomError("Inserisci il nome sul citofono");
      hasError = true;
    } else {
      setIntercomError("");
    }
    if (!comune) {
      setComuneError("Seleziona il comune di consegna");
      hasError = true;
    } else {
      setComuneError("");
    }

    return !hasError;
  };

  const getComuneData = () =>
    COMUNI_CONSEGNA.find((c) => c.nome === comune) ?? null;

  return {
    deliverySelected,
    handleDeliveryToggle,
    address,
    setAddress,
    addressError,
    setAddressError,
    civicNumber,
    setCivicNumber,
    civicError,
    setCivicError,
    intercom,
    setIntercom,
    intercomError,
    setIntercomError,
    comune,
    setComune,
    comuneError,
    setComuneError,
    validateDelivery,
    getComuneData,
  };
};
