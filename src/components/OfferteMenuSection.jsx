import React, { useEffect, useState } from "react";
import styles from "../style/OfferteMenuSection.module.css";
import { offerte_menu } from "../data/offerte_menu.json";

export default function OfferteMenuSection({ id }) {
    const isBrowser = typeof window !== "undefined";
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        if (!isBrowser || !window.orderManager) return;
        const interval = setInterval(() => {
            const updated = {};
            offerte_menu.forEach((item) => {
                const id = `offerta_${item.nome.toLowerCase().replace(/\s+/g, "_")}`;
                updated[id] = window.orderManager.getItemQuantity(id);
            });
            setQuantities(updated);
        }, 200);
        return () => clearInterval(interval);
    }, [isBrowser]);

    const handleAddToOrder = (item) => {
        if (!window.orderManager) return;
        const id = `offerta_${item.nome.toLowerCase().replace(/\s+/g, "_")}`;
        const orderItem = { id: id, nome: item.nome, prezzo: item.prezzo };
        window.orderManager.addItem(orderItem, 1);
    };

    const handleIncreaseQuantity = (item) => {
        if (!window.orderManager) return;
        const id = `offerta_${item.nome.toLowerCase().replace(/\s+/g, "_")}`;
        const current = window.orderManager.getItemQuantity(id);

        if (current === 0) {
            window.orderManager.addItem({ id, nome: item.nome, prezzo: item.prezzo }, 1);
        } else {
            window.orderManager.updateQuantity(id, current + 1);
        }

        // aggiorna stato React subito
        setQuantities((prev) => ({
            ...prev,
            [id]: (prev[id] || 0) + 1,
        }));
    };

    const handleDecreaseQuantity = (item) => {
        if (!window.orderManager) return;
        const id = `offerta_${item.nome.toLowerCase().replace(/\s+/g, "_")}`;
        const current = window.orderManager.getItemQuantity(id);

        if (current > 0) {
            window.orderManager.updateQuantity(id, current - 1);
            setQuantities((prev) => ({
                ...prev,
                [id]: Math.max((prev[id] || 0) - 1, 0),
            }));
        }
    };

    return (
        <section id={id} className={styles.offerteSection}>
            <h2 className={styles.title}>Offerte Menu</h2>

            <ul className={styles.offerteList}>
                {offerte_menu.map((item) => {
                    const id = `offerta_${item.nome.toLowerCase().replace(/\s+/g, "_")}`;
                    const quantity = quantities[id] || 0;

                    return (
                        <li key={id} className={styles.offertaCard}>
                            <div className={styles.offertaImage}>
                                {/* QUI potrai aggiungere l'immagine */}
                                <div className={styles.imagePlaceholder}>Immagine Menu</div>
                            </div>
                            <div className={styles.offertaInfo}>
                                <h3 className={styles.nome}>{item.nome}</h3>
                                <p className={styles.ingredienti}>{item.ingredienti}</p>
                                <p className={styles.prezzo}>€{item.prezzo.toFixed(2)}</p>

                                <div className={styles.controls}>
                                    <div className={styles.quantitySelector}>
                                        <button
                                            onClick={() => handleDecreaseQuantity(item)}
                                            disabled={quantity === 0}
                                        >
                                            −
                                        </button>
                                        <span>{quantity}</span>
                                        <button
                                            onClick={() => handleIncreaseQuantity(item)}
                                            disabled={quantity >= 20}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        className={styles.btnAdd}
                                        onClick={() => handleAddToOrder(item)}
                                    >
                                        Aggiungi
                                    </button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
