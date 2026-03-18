import styles from "../../style/HoursSection.module.css";
import { HOURS_DISPLAY } from "../../config/businessHours";

interface HoursSectionProps {
  id: string;
}

export const HoursSection = ({ id }: HoursSectionProps) => {
  return (
    <section id={id} className={styles.hoursSection}>
      <h2 className={styles.title}>Orari</h2>
      <ul className={styles.hoursList}>
        {HOURS_DISPLAY.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
};
