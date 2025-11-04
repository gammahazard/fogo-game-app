"use client";

import { useState, useEffect } from "react";
import { useSession, isEstablished, useConnection } from "@fogo/sessions-sdk-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import styles from './Balance.module.css';

// The fUSD Mint Address you are using
const fUSDMint = new PublicKey("fUSDNGgHkZfwckbr5RLLvRbvqvRcTLdH9hcHJiq4jry");
// This is NATIVE_MINT, which you're calling FOGO
const fogoMint = new PublicKey("So11111111111111111111111111111111111111112");


export const BalanceDisplay = () => {
  const sessionState = useSession();
  const connection = useConnection();
  const established = isEstablished(sessionState);

  const [fogoBalance, setFogoBalance] = useState<string | null>(null);
  const [fusdBalance, setFusdBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!established) return;

    const fetchBalances = async () => {
      setIsLoading(true);
      
      // 1. Get FOGO (SOL) Balance
      try {
        const lamports = await connection.getBalance(sessionState.walletPublicKey);
        setFogoBalance((lamports / LAMPORTS_PER_SOL).toFixed(4));
      } catch (error) {
        console.error("Error fetching FOGO balance:", error);
        setFogoBalance("Error");
      }

      // 2. Get fUSD Balance
      try {
        // Get the user's fUSD token account address
        const fusdAta = getAssociatedTokenAddressSync(
          fUSDMint,
          sessionState.walletPublicKey
        );
        
        // Get the balance of that token account
        const balanceResponse = await connection.getTokenAccountBalance(fusdAta);
        setFusdBalance(balanceResponse.value.uiAmountString ?? "0.00");
      
      } catch (error) {
        // This error is common if the user has no fUSD token account
        console.log("Could not fetch fUSD balance (account may not exist):", error);
        setFusdBalance("0.00");
      }
      
      setIsLoading(false);
    };

    fetchBalances();
  }, [established, sessionState, connection]); // Re-fetch if session changes

  if (!established) {
    // Don't show anything if not logged in
    return null; 
  }

  const foboDisplay = isLoading ? "Loading..." : fogoBalance;
  const fusdDisplay = isLoading ? "Loading..." : fusdBalance;

  return (
    <div className={styles.balanceContainer}>
      <h3 className={styles.balanceTitle}>Your Balances</h3>
      <div className={styles.balanceRow}>
        <span className={styles.tokenName}>FOGO:</span>
        <span className={styles.tokenAmount}>{foboDisplay}</span>
      </div>
      <div className={styles.balanceRow}>
        <span className={styles.tokenName}>fUSD:</span>
        <span className={styles.tokenAmount}>{fusdDisplay}</span>
      </div>
    </div>
  );
};