import { ReactNode } from 'react';
import styles from './GameModal.module.css';

// *** FIX: Changed props to accept a 'game' object, 
// matching how it's used on the page. ***
type GameModalProps = {
  game: {
    title: string;
    description: string;
  };
  onClose: () => void;
  children: ReactNode;
};

export const GameModal = ({ game, onClose, children }: GameModalProps) => {
  
  // *** FIX: Removed the 'isOpen' prop and check. ***
  // The parent page (app/page.tsx) already handles this
  // by conditionally rendering the component (using {selectedGame && ...})

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
          {/* *** FIX: Get title from the 'game' object *** */}
          <h2 className={styles.modalTitle}>{game.title}</h2>
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

