import { useState } from "react";

import styles from "../../style/ContactSection.module.css";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useCookieConsent } from "../../context/CookieConsentContext";
import allergeniData from "../../data/allergeni.json";
import { allergeniIcons } from "../../config/allergeniIcons";

import type { AllergeniData, AllergeniIconsMap } from "../../types";

const typedAllergeniData = allergeniData as AllergeniData;
const typedAllergeniIcons = allergeniIcons as AllergeniIconsMap;

interface ContactSectionProps {
  id: string;
}

export const ContactSection = ({ id }: ContactSectionProps) => {
  const [showAllergens, setShowAllergens] = useState(false);
  const sectionRef = useScrollAnimation<HTMLElement>();
  const { consent, reset } = useCookieConsent();
  const mapsAllowed = consent === "accepted";

  return (
    <section ref={sectionRef} id={id} className={styles.contactSection}>
      <h2 className={styles.title}>Contatti</h2>
      <div className={styles.contactInfo}>
        <div className={styles.phone}>
          Numero di telefono: <br />
          <a href="tel:0362 197 2430">0362 197 2430</a>
          <br />
          <a href="tel:3464052750">3464052750</a>
        </div>
        <div className={styles.address}>
          Indirizzo: <br /> Via Monterosa 132, Desio (MB)
        </div>
        <div className={styles.socialLinks}>
          <a
            href="https://www.instagram.com/la_teglia_desio/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={styles.socialLink}
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com/LaTeglia2019"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className={styles.socialLink}
          >
            Facebook
          </a>
        </div>
      </div>
      <div className={styles.mapContainer}>
        {mapsAllowed ? (
          <iframe
            title="Mappa La Teglia"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2790.5807345505305!2d9.19151667914968!3d45.6190688363988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786bc2e13d7d0fd%3A0x97d1f73a87c27be4!2sLa%20Teglia!5e0!3m2!1sit!2sit!4v1760802077903!5m2!1sit!2sit"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <a
            href="https://maps.google.com/?q=La+Teglia,+Via+Monterosa+132,+Desio+MB"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapPlaceholder}
          >
            <span className={styles.mapPlaceholderIcon}>&#128205;</span>
            <span className={styles.mapPlaceholderText}>
              Apri su Google Maps
            </span>
            <span className={styles.mapPlaceholderSub}>
              Via Monterosa 132, Desio (MB)
            </span>
          </a>
        )}
      </div>
      <h2 className={styles.title} style={{ fontSize: "1rem", marginBottom: "0px" }}>
        {typedAllergeniData.titolo}
      </h2>
      <p>{typedAllergeniData.descrizione}</p>

      <button
        className={styles.btnToggleLegend}
        onClick={() => setShowAllergens(!showAllergens)}
        aria-expanded={showAllergens}
        aria-controls="allergenLegend"
      >
        {showAllergens ? "Nascondi Legenda Allergeni" : "Mostra Legenda Allergeni"}
      </button>

      {showAllergens && (
        <div id="allergenLegend" className={styles.allergenLegend}>
          {typedAllergeniData.allergeni.map(({ id, nome, dettaglio }) => {
            const IconComponent = typedAllergeniIcons[id] || null;
            return (
              <div key={id} className={styles.allergenItem}>
                {IconComponent && <IconComponent className={styles.allergenIcon} />}
                <span className={styles.allergenName}>
                  {nome} - {dettaglio}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {consent !== "pending" && (
        <button className={styles.cookieSettingsBtn} onClick={reset}>
          Impostazioni cookie
        </button>
      )}
    </section>
  );
};
