"use client"

import { useSession, isEstablished } from "@fogo/sessions-sdk-react";
import styles from "./page.module.css";
import Link from 'next/link';

export default () => {
  // Get the current session state
  const sessionState = useSession();
  const established = isEstablished(sessionState);

  return (
    <div className={styles.heroContainer}>
      
      <h1 className={styles.heroTitle}>
        Play Games, Earn Rewards
      </h1>

      {/* Conditionally render the button or the new text prompt */}
      {established ? (
        <Link href="/app" className={styles.ctaButton}>
          Launch App
        </Link>
      ) : (
        // --- THIS IS THE CHANGE ---
        // Instead of a button, show a text prompt
        <p className={styles.signInPrompt}>
          Please sign in from the navbar to begin
        </p>
      )}
    </div>
  );
}

