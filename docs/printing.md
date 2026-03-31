# Stampa Scontrini — Epson TM-m30

## Architettura

La stampante **Epson TM-m30** espone un server HTTP locale (porta 80) con l'API **ePOS SDK**.
Il sito utilizza lo SDK JavaScript `epos-2.27.0.js` (caricato da `public/vendor/`) che comunica con la stampante via **WebSocket** (ePOSDevice) + **HTTP POST** (ePOS-Print XML).

### Flusso di stampa (ePOSDevice SDK)

1. `usePrinter.ts` crea un `epson.ePOSDevice()` e si connette all'IP configurato (porta 8008)
2. Crea un device di tipo `DEVICE_TYPE_PRINTER` con ID `local_printer`
3. `receiptFormatter.ts` compone lo scontrino usando i metodi del printer (`addText`, `addTextSize`, ecc.)
4. Chiama `printer.send()` — lo SDK invia il tutto alla stampante

### File coinvolti

- `public/vendor/epos-2.27.0.js` — SDK Epson ePOS (caricato via `<script>` in `index.astro`)
- `src/types/epson.d.ts` — Type declarations per lo SDK
- `src/hooks/usePrinter.ts` — Hook React con stato connessione/stampa
- `src/lib/receiptFormatter.ts` — Formattazione scontrino (layout, prezzi, QR code)

## Il problema: CORS / Mixed Content

Il sito è hostato su **GitHub Pages** (HTTPS). La stampante è raggiungibile solo via **HTTP** sulla rete locale. I browser moderni bloccano le richieste HTTP da pagine HTTPS (**mixed content**).

Risultato: la stampa **non funziona** dal sito in produzione.

## Soluzione testata: proxy Node locale

Un proxy Node.js (`print-proxy.cjs`) gira sulla macchina locale e inoltra le richieste alla stampante, aggiungendo gli header CORS necessari.

### Come funzionava

```
Browser (HTTPS) → http://127.0.0.1:8008 → proxy Node → http://<IP_STAMPANTE>:80
```

Il proxy:
- Ascolta su `localhost:8008`
- Inoltra tutte le richieste all'IP della stampante sulla porta 80
- Aggiunge `Access-Control-Allow-Origin: *` alle risposte
- Gestisce le preflight OPTIONS

### Avvio

```bash
node print-proxy.cjs <IP_STAMPANTE> [porta_locale]
# Es: node print-proxy.cjs 192.168.1.100
```

Nel pannello admin del sito, impostare l'IP stampante a `127.0.0.1`.

### Approccio XML diretto

Insieme al proxy, era stata implementata una variante che costruiva l'XML ePOS-Print direttamente (senza lo SDK JavaScript), tramite `printerXmlBuilder.ts`. Questo eliminava la dipendenza da `ePOSDevice` e usava un semplice `fetch()` POST.

Il flusso era:
1. `PrinterXmlBuilder` implementa la stessa interfaccia di `ePOSPrint`
2. `receiptFormatter.ts` formatta lo scontrino (stessa logica)
3. `builder.toXML()` produce il SOAP envelope
4. `usePrinter.ts` invia il XML via `fetch()` al proxy

## Stato attuale

I file del proxy e dell'XML builder sono stati rimossi dal progetto sito (commit cleanup). Il sito è tornato alla versione originale con lo SDK ePOSDevice.

I file rimossi:
- `print-proxy.cjs`
- `src/lib/printerXmlBuilder.ts`

## Note per il futuro

Il **gestionale** (progetto separato) avrà lo stesso problema CORS se hostato su Vercel (HTTPS). Soluzioni possibili:

1. **Proxy locale** — stessa soluzione, il proxy gira sul tablet/PC della cassa
2. **Hosting locale** — servire il gestionale da `localhost` (elimina il problema mixed content)
3. **Service worker** — intercettare le richieste alla stampante e inoltrarle via HTTP

La soluzione più pragmatica resta il proxy locale: un singolo comando `node print-proxy.cjs <IP>` e funziona.
