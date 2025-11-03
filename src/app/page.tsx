"use client"; // This page needs to be a client component to check the session

import { useSession, isEstablished } from "@fogo/sessions-sdk-react";
import Link from 'next/link';
import styles from "./page.module.css"; 
// 1. Import useState and MouseEvent
import { useState } from "react";
import type { MouseEvent }from "react";

export default () => {
  // Get the current session state
  const sessionState = useSession();
  const established = isEstablished(sessionState);

  // 2. Add loading state for the button
  const [isLoading, setIsLoading] = useState(false);

  // 3. Create click handler to prevent spam
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isLoading) {
      e.preventDefault(); // Stop navigation if already loading
      return;
    }

    setIsLoading(true);
    // The 1-second-timeout has been removed.
    // The state will only reset if the user navigates back to this page.
  };

  return (
    <div className={styles.heroContainer}>
      
      <h1 className={styles.heroTitle}>
        Play Games, Earn Rewards
      </h1>

      {/* Conditionally render the button or the text prompt */}
      {established ? (
        <Link 
          href="/app" 
          // 4. Add conditional class and onClick handler
          // We use 'styles.disabled' which you'll need to add to your CSS
          className={`${styles.ctaButton} ${isLoading ? styles.disabled : ''}`}
          onClick={handleClick}
          // We can also add aria-disabled for accessibility
          aria-disabled={isLoading}
        >
          {/* 5. Change text while loading */}
          {isLoading ? "Loading..." : "Launch App"}
        </Link>
      ) : (
        <p className={styles.signInPrompt}>
          Please sign in from the navbar to begin
        </p>
      )}
    </div>
  );
}

