import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type ConsentStatus = "pending" | "accepted" | "rejected";

interface CookieConsentContextType {
  consent: ConsentStatus;
  accept: () => void;
  reject: () => void;
  reset: () => void;
}

const STORAGE_KEY = "la-teglia-cookie-consent";
const FONTS_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Oswald:wght@200..700&display=swap";

const CookieConsentContext = createContext<CookieConsentContextType>({
  consent: "pending",
  accept: () => {},
  reject: () => {},
  reset: () => {},
});

const loadGoogleFonts = () => {
  if (document.querySelector(`link[href="${FONTS_URL}"]`)) return;

  const preconnect1 = document.createElement("link");
  preconnect1.rel = "preconnect";
  preconnect1.href = "https://fonts.googleapis.com";
  document.head.appendChild(preconnect1);

  const preconnect2 = document.createElement("link");
  preconnect2.rel = "preconnect";
  preconnect2.href = "https://fonts.gstatic.com";
  preconnect2.crossOrigin = "anonymous";
  document.head.appendChild(preconnect2);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = FONTS_URL;
  document.head.appendChild(link);
};

export const CookieConsentProvider = ({ children }: { children: ReactNode }) => {
  const [consent, setConsent] = useState<ConsentStatus>("pending");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "accepted" || stored === "rejected") {
      setConsent(stored);
    }
  }, []);

  useEffect(() => {
    if (consent === "accepted") {
      loadGoogleFonts();
    }
  }, [consent]);

  const accept = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
  }, []);

  const reject = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setConsent("rejected");
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setConsent("pending");
  }, []);

  return (
    <CookieConsentContext.Provider value={{ consent, accept, reject, reset }}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => useContext(CookieConsentContext);
