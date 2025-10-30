import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import styles from '../style/HomeSection.module.css';

export default function HomeSection({ id }) {
  const images = [
    '/PizzaLandingPage/assets/pizza.png',
    '/PizzaLandingPage/assets/piadinaKebab.jpg',
    '/PizzaLandingPage/assets/pizze.jpg',
  ];

  return (
    <section id={id} className={styles.homeSection}>
      <Carousel
        transitionTime={1000}
        showArrows={false}
        showIndicators={false}
        showThumbs={false}
        infiniteLoop={true}
        autoPlay={true}
        interval={4000}
        useKeyboardArrows={true}
        stopOnHover={true}
        swipeable={false}
        dynamicHeight={false}
        emulateTouch={false}
        statusFormatter={() => ``}
      >
        {images.map((src, index) => (
          <div key={index} className={styles.slide}>
            <img
              src={src}
              alt={`Immagine pizzeria ${index + 1}`}
              className={styles.coverImage}
            />
          </div>
        ))}
      </Carousel>
      <p className={styles.description}>
        Scopri La nostra deliziosa pizza in teglia, preparate con ingredienti freschi
      </p>
      <button
        className={styles.ctaButton}
        onClick={() => {
          const menuSection = document.getElementById('menu-section');
          if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Scopri il menù
      </button>
      <p className={styles.description} style={{ marginBottom: '0', fontSize: '0.9rem' }}>
        Pagamento anche con Satispay e carte di credito, anche a domicilio!
      </p>
      <p className={styles.description} style={{ marginTop: '0', fontSize: '0.9rem' }}>
        Consegna effettuata al citofono e non al piano
      </p>
    </section>
  );
}
