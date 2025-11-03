"use client"; // This page needs to be a client component to check the session

import { useSession, isEstablished } from "@fogo/sessions-sdk-react";
import Link from 'next/link';
import styles from "./page.module.css"; 

export default () => {
  // Get the current session state
  const sessionState = useSession();
  const established = isEstablished(sessionState);

  return (
    <div className={styles.heroContainer}>
      
      <h1 className={styles.heroTitle}>
        Play Games, Earn Rewards
      </h1>

      {/* Conditionally render the button or the text prompt */}
      {established ? (
        <Link href="/app" className={styles.ctaButton}>
          Launch App
        </Link>
      ) : (
        <p className={styles.signInPrompt}>
          Please sign in from the navbar to begin
        </p>
      )}
    </div>
  );
}

