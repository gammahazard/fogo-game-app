import Image from 'next/image';
import styles from './GameCard.module.css';

type GameCardProps = {
  title: string;
  description: string;
  imageUrl: string;
  onClick: () => void;
};

export const GameCard = ({ title, description, imageUrl, onClick }: GameCardProps) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageWrapper}>
        <Image
          src={imageUrl}
          alt={title}
          layout="fill"
          objectFit="cover"
          className={styles.cardImage}
        />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
      </div>
    </div>
  );
};
