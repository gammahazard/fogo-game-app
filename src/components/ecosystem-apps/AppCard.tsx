"use client";

import Image from 'next/image';
import styles from './AppCard.module.css';

interface AppCardProps {
  title: string;
  imageUrl: string;
  onClick: () => void;
}

export const AppCard = ({ title, imageUrl, onClick }: AppCardProps) => {
  return (
    <div className={styles.appCard} onClick={onClick}>
      <div className={styles.imageContainer}>
        <Image
          src={imageUrl}
          alt={`${title} logo`}
          width={80}
          height={80}
          className={styles.appImage}
        />
      </div>
      <h3 className={styles.appTitle}>{title}</h3>
      <button className={styles.viewButton}>View</button>
    </div>
  );
};