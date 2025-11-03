import Image from 'next/image'; // <-- 1. Import the Next.js Image component
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Your original copyright text */}
      <p>© {new Date().getFullYear()} Fogo Sessions Demo</p>

      {/* 2. Add the new "Powered by" section */}
      <div className={styles.poweredBy}>
        <span>Powered by</span>
        <Image
          src="/logo.jpg" // <-- 3. Path is root '/' because it's in the 'public' folder
          alt="Fogo Logo"
          width={24}   // <-- 4. Set width and height
          height={24}
          className={styles.logo}
        />
        <span>Fogo</span>
      </div>
    </footer>
  );
};