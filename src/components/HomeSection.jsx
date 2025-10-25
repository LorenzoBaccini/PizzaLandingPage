import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import styles from '../style/HomeSection.module.css';

export default function HomeSection({ id }) {
  const images = [
    '/src/assets/pizza.png',
    '/src/assets/piadinaKebab.jpg',
    '/src/assets/pizze.jpg',
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
      <button
        className={styles.ctaButton}
        onClick={() => {
          const menuSection = document.getElementById('menu-section');
          if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Scopri il menù
      </button>
      <p className={styles.description}>
        Scopri La nostra deliziosa pizza in teglia, preparate con ingredienti freschi
      </p>
    </section>
  );
}
