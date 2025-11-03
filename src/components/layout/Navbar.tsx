"use client"

import Link from 'next/link'; // <-- 1. Import Link
import { SessionButton } from "@fogo/sessions-sdk-react";
import styles from './Navbar.module.css'; 

export const Navbar = () => {
  return (
    <header className={styles.navbar}> 
      {/* 2. Wrap the title in a Link component */}
      <Link href="/" className={styles.titleLink}>
        <h1 className={styles.title}>CatchyTitle</h1>
      </Link>
      <SessionButton />
    </header>
  );
};
