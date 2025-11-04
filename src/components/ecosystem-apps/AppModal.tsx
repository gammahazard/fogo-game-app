"use client";

import { ReactNode } from 'react';
import styles from './AppModal.module.css';

interface AppModalProps {
  app: { title: string };
  onClose: () => void;
  children: ReactNode;
}

export const AppModal = ({ app, onClose, children }: AppModalProps) => {
  // Prevent clicks inside the modal from closing it
  const onContentClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={onContentClick}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{app.title} Stats</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
};