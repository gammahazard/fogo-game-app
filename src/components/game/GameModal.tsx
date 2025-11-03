import { ReactNode } from 'react';
import styles from './GameModal.module.css';

type GameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export const GameModal = ({ isOpen, onClose, title, children }: GameModalProps) => {
  if (!isOpen) {
    return null;
  }

  // Prevents closing modal when clicking inside content
  const onContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    // The overlay
    <div className={styles.modalOverlay} onClick={onClose}>
      
      {/* The content box */}
      <div className={styles.modalContent} onClick={onContentClick}>
        
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Modal Body (where game/content goes) */}
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
};
