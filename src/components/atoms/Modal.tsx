import { useEffect, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";

import styles from "../../style/Modal.module.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  zIndex?: number;
}

export const Modal = ({ open, onClose, title, footer, children, zIndex = 5000 }: ModalProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} style={{ zIndex }} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className={styles.header}>
            <div className={styles.headerTitle}>{title}</div>
            <button className={styles.closeButton} onClick={onClose} aria-label="Chiudi">
              &times;
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
};
