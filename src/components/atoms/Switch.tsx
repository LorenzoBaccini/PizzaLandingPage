import styles from "../../style/Switch.module.css";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Switch = ({ checked, onChange }: SwitchProps) => {
  return (
    <label className={styles.label}>
      <input
        type="checkbox"
        className={styles.hiddenInput}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`${styles.track} ${checked ? styles.active : ""}`}>
        <span className={styles.thumb} />
      </span>
    </label>
  );
};
