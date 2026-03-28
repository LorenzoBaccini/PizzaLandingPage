import { useState, useCallback } from "react";

import { formatReceipt } from "../lib/receiptFormatter";

import type { Order } from "../types";

type PrinterStatus = "idle" | "connecting" | "printing" | "success" | "error";

const PRINTER_IP_KEY = "printer_ip";
const PRINTER_PORT = 8008;
const DEVICE_ID = "local_printer";

export const getPrinterIp = (): string => localStorage.getItem(PRINTER_IP_KEY) ?? "";

export const setPrinterIp = (ip: string): void => {
  localStorage.setItem(PRINTER_IP_KEY, ip);
};

export const usePrinter = () => {
  const [status, setStatus] = useState<PrinterStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);

  const print = useCallback((order: Order) => {
    setPrintingOrderId(order.id);
    const ip = getPrinterIp();
    if (!ip) {
      setStatus("error");
      setErrorMessage("IP stampante non configurato");
      return;
    }

    if (typeof epson === "undefined") {
      setStatus("error");
      setErrorMessage("SDK Epson non caricato (epos-print.js mancante)");
      return;
    }

    setStatus("connecting");
    setErrorMessage("");

    const device = new epson.ePOSDevice();

    device.connect(ip, PRINTER_PORT, (resultConnect: string) => {
      if (resultConnect !== "OK" && resultConnect !== "SSL_CONNECT_OK") {
        setStatus("error");
        setErrorMessage(`Connessione fallita: ${resultConnect}`);
        return;
      }

      device.createDevice(
        DEVICE_ID,
        device.DEVICE_TYPE_PRINTER,
        { crypto: false, buffer: false },
        (printer: epson.ePOSPrint, retcode: string) => {
          if (retcode !== "OK") {
            setStatus("error");
            setErrorMessage(`Errore creazione device: ${retcode}`);
            device.disconnect();
            return;
          }

          setStatus("printing");

          printer.onreceive = (res) => {
            setStatus(res.success ? "success" : "error");
            if (!res.success) setErrorMessage(`Errore stampa: ${res.code}`);
            device.disconnect();
          };

          printer.onerror = (err) => {
            setStatus("error");
            setErrorMessage(`Errore: ${err.responseText}`);
            device.disconnect();
          };

          formatReceipt(printer, order);
          printer.send();
        },
      );
    });
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setErrorMessage("");
    setPrintingOrderId(null);
  }, []);

  return { status, errorMessage, printingOrderId, print, reset };
};
