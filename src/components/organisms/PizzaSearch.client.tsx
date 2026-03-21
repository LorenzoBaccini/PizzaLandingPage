import styles from "../../style/PizzaSearch.module.css";

interface PizzaSearchProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
}

export const PizzaSearch = ({ searchInput, setSearchInput }: PizzaSearchProps) => {
  return (
    <div className={styles.searchContainer}>
      <label htmlFor="searchMenu" className={styles.searchLabel}>
        Cerca nel menù:
      </label>
      <div className={styles.searchWrapper}>
        <input
          id="searchMenu"
          type="text"
          placeholder="Cerca prodotti e ingredienti"
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
