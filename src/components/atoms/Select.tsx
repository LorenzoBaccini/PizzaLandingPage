import styles from "../../style/Select.module.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string | null;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
  style?: React.CSSProperties;
}

export const Select = ({ value, onChange, options, placeholder, error, style }: SelectProps) => {
  return (
    <div className={styles.wrapper} style={style}>
      <select
        className={`${styles.select} ${error ? styles.error : ""}`}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className={styles.arrow}>&#9660;</span>
    </div>
  );
};
