import style from "../../style/MyCarousel.module.css";

const CAROUSEL_IMAGES = [
  { src: "https://picsum.photos/id/19/200/300", alt: "Foto pizzeria 1" },
  { src: "https://picsum.photos/id/35/200/300", alt: "Foto pizzeria 2" },
  { src: "https://picsum.photos/id/41/200/300", alt: "Foto pizzeria 3" },
  { src: "https://picsum.photos/id/182/200/300", alt: "Foto pizzeria 4" },
  { src: "https://picsum.photos/id/213/200/300", alt: "Foto pizzeria 5" },
  { src: "https://picsum.photos/id/244/200/300", alt: "Foto pizzeria 6" },
  { src: "https://picsum.photos/id/261/200/300", alt: "Foto pizzeria 7" },
  { src: "https://picsum.photos/id/270/200/300", alt: "Foto pizzeria 8" },
  { src: "https://picsum.photos/id/309/200/300", alt: "Foto pizzeria 9" },
];

export const MyCarousel = () => {
  return (
    <div className={style.wrapper}>
      {CAROUSEL_IMAGES.map(({ src, alt }) => (
        <img key={src} src={src} alt={alt} />
      ))}
    </div>
  );
};
