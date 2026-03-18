import styles from "../../style/PizzaSearch.module.css";

interface PizzaSearchProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
}

export const PizzaSearch = ({ searchInput, setSearchInput }: PizzaSearchProps) => {
  return (
    <div className={styles.searchContainer}>
      <label htmlFor="searchPizze" className={styles.searchLabel}>
        Cerca pizze e ingredienti:
      </label>
      <div className={styles.searchWrapper}>
        <input
          id="searchPizze"
          type="text"
          placeholder="Cerca pizze e ingredienti"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          autoComplete="off"
          className={styles.searchInput}
        />
        {searchInput && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => setSearchInput("")}
            aria-label="Pulisci campo"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};
