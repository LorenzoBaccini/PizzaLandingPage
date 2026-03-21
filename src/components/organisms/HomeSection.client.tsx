import styles from "../../style/HomeSection.module.css";
import { Button } from "../atoms/Button";

interface HomeSectionProps {
  id: string;
}

const BASE_URL = import.meta.env.BASE_URL;

export const HomeSection = ({ id }: HomeSectionProps) => {
  return (
    <section
      id={id}
      className={styles.homeSection}
      style={{ backgroundImage: `url(${BASE_URL}assets/home-section-image.png)` }}
    >
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>LA TEGLIA</h1>
        <p className={styles.description}>
          Scopri la nostra deliziosa pizza in teglia, preparata con ingredienti freschi
        </p>
        <Button
          size="large"
          role="navigation"
          label="Scopri il menù"
          variant="primaryAlt"
          onClick={() => {
            const menuSection = document.getElementById("menu-section");
            if (menuSection) menuSection.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <div className={styles.infoTexts}>
          <p>Pagamento anche con Satispay e carte di credito, anche a domicilio!</p>
          <p>Consegna effettuata al citofono e non al piano</p>
        </div>
      </div>
    </section>
  );
};
