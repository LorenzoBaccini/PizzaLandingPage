import { useCookieConsent } from "../../context/CookieConsentContext";
import styles from "../../style/CookieBanner.module.css";

export const CookieBanner = () => {
  const { consent, accept, reject } = useCookieConsent();

  if (consent !== "pending") return null;

  return (
    <div className={styles.banner}>
      <p className={styles.text}>
        Questo sito utilizza servizi di terze parti (Google Fonts, Google Maps).
        Puoi accettare o rifiutare il loro utilizzo. Rifiutando, il sito funzionerà
        comunque con font di sistema e senza mappa interattiva.
      </p>
      <div className={styles.actions}>
        <button className={styles.rejectBtn} onClick={reject}>
          Rifiuta
        </button>
        <button className={styles.acceptBtn} onClick={accept}>
          Accetta
        </button>
      </div>
    </div>
  );
};
