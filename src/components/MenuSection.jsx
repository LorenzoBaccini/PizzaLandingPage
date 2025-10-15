import React from 'react';
import styles from '../style/MenuSection.module.css';

const menuData = {
  Kebab: [
    { name: 'Kebab Classico', price: '7€', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png' },
    { name: 'Kebab Extra Carne', price: '9€', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shiny-stone.png' },
  ],
  Contorni: [
    { name: 'Patatine Fritte', price: '3€', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png' },
    { name: 'Insalata Mista', price: '4€', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/full-restore.png' },
  ],
  Bevande: [
    { name: 'Acqua Naturale', price: '2€', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/water-stone.png' },
    { name: 'Bibita Gassata', price: '3€', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/soda-pop.png' },
  ],
};

export default function MenuSection({ id }) {
  return (
    <section id={id} className={styles.menuSection}>
      <h2 className={styles.menuTitle}>Menù</h2>
      {Object.entries(menuData).map(([category, dishes]) => (
        <div key={category} className={styles.category}>
          <h3 className={styles.categoryTitle}>{category}</h3>
          <ul className={styles.menuList}>
            {dishes.map(({ name, price, img }) => (
              <li key={name} className={styles.menuItem}>
                <img src={img} alt={name} className={styles.dishImage} />
                <span className={styles.dishName}>{name}</span>
                <span className={styles.price}>{price}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
