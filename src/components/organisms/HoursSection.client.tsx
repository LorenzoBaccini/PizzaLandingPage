import styles from "../../style/HoursSection.module.css";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

interface HoursSectionProps {
  id: string;
}

const WEEKLY_HOURS = [
  { day: "Lunedì", hours: "11:00 – 15:00 / 17:30 – 00:00" },
  { day: "Martedì", hours: "11:00 – 15:00 / 17:30 – 00:00" },
  { day: "Mercoledì", hours: "11:00 – 15:00 / 17:30 – 00:00" },
  { day: "Giovedì", hours: "11:00 – 15:00 / 17:30 – 00:00" },
  { day: "Venerdì", hours: "11:00 – 15:00 / 17:30 – 00:00" },
  { day: "Sabato", hours: "11:00 – 15:00 / 17:30 – 00:00" },
  { day: "Domenica", hours: "18:00 – 00:00" },
];

const getDayIndex = (): number => {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
};

export const HoursSection = ({ id }: HoursSectionProps) => {
  const sectionRef = useScrollAnimation<HTMLElement>();
  const todayIndex = getDayIndex();

  return (
    <section ref={sectionRef} id={id} className={styles.hoursSection}>
      <h2 className={styles.title}>Orari</h2>
      <p className={styles.subtitle}>Aperti tutti i giorni, anche i festivi</p>
      <ul className={styles.hoursList}>
        {WEEKLY_HOURS.map(({ day, hours }, index) => (
          <li
            key={day}
            className={`${styles.hoursItem} ${index === todayIndex ? styles.today : ""}`}
          >
            <span className={styles.dayName}>{day}</span>
            <span className={styles.dayHours}>{hours}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
