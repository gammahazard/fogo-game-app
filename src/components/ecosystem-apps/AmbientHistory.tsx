"use client";

import { useState, useEffect } from "react";
import { useSession, isEstablished, useConnection } from "@fogo/sessions-sdk-react";
import { PublicKey, TransactionResponse } from "@solana/web3.js";
import styles from './AmbientHistory.module.css'; // Let's add some styles

// The Ambient Program ID from their docs
const AMBIENT_PROGRAM_ID = new PublicKey("ambi3LHRUzmU187u4rP46rX6wrYrLtU1Bmi5U2yCTGE");

export const AmbientHistory = () => {
  const sessionState = useSession();
  const connection = useConnection();
  const established = isEstablished(sessionState);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // This will hold our Phase 2 results (full, non-parsed transactions)
  const [ambientTxs, setAmbientTxs] = useState<TransactionResponse[]>([]);
  
  // NEW: State to hold the logs of the selected TX for debugging
  const [selectedTxLogs, setSelectedTxLogs] = useState<string[] | null>(null);

  useEffect(() => {
    if (!established) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      setAmbientTxs([]);
      setSelectedTxLogs(null);

      try {
        // --- PHASE 1: Fetch Signatures ---
        console.log("Phase 1: Fetching signatures...");
        const signatures = await connection.getSignaturesForAddress(
          sessionState.walletPublicKey,
          { limit: 200 } // Your wallet has few, so 200 is plenty
        );

        if (signatures.length === 0) {
          setError("No transaction history found for this wallet.");
          setIsLoading(false);
          return;
        }

        console.log(`Phase 2: Fetching ${signatures.length} full transactions (one by one)...`);
        
        const foundTxs: TransactionResponse[] = [];

        // --- PHASE 2 (NEW): Loop and check logs ---
        for (const sigInfo of signatures) {
          const tx = await connection.getTransaction(sigInfo.signature, {
            maxSupportedTransactionVersion: 0,
          });

          if (!tx || !tx.meta || !tx.meta.logMessages) continue;

          // OUR NEW, ROBUST FILTER:
          // Check if any log message mentions the Ambient Program ID
          const isAmbientTx = tx.meta.logMessages.some(log => 
            log.includes(AMBIENT_PROGRAM_ID.toBase58())
          );

          if (isAmbientTx) {
            foundTxs.push(tx);
          }
        }
        
        console.log(`Phase 2 Complete: Found ${foundTxs.length} Ambient transactions.`);
        setAmbientTxs(foundTxs);

        if (foundTxs.length === 0) {
          setError("No Ambient transactions found in your recent history.");
        }

      } catch (err: any) {
        console.error("Failed to fetch transaction history:", err);
        setError("An error occurred while fetching history.");
      }
      
      setIsLoading(false);
    };

    fetchHistory();
  }, [established, sessionState, connection]);

  const handleTxClick = (tx: TransactionResponse) => {
    // Load this transaction's logs into the debug viewer
    setSelectedTxLogs(tx.meta?.logMessages || ["No logs found."]);
  };

  if (isLoading) {
    return <div className={styles.loading}>Scanning transaction history...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.historyContainer}>
      <h4 className={styles.title}>Recent Ambient Transactions</h4>
      <p>Found {ambientTxs.length} transaction(s) involving the Ambient program.</p>
      
      <div className={styles.columns}>
        {/* Column 1: List of Txs */}
        <div className={styles.txList}>
          {ambientTxs.map((tx) => (
            <button 
              key={tx.transaction.signatures[0]} 
              className={styles.txButton}
              onClick={() => handleTxClick(tx)}
            >
              {tx.transaction.signatures[0].substring(0, 20)}...
              <a 
                href={`https://solscan.io/tx/${tx.transaction.signatures[0]}?cluster=testnet`} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} // Don't trigger button click
                className={styles.solscanLink}
              >
                (Solscan)
              </a>
            </button>
          ))}
        </div>

        {/* Column 2: Log Viewer */}
        <div className={styles.logViewer}>
          <h5 className={styles.logTitle}>Transaction Logs</h5>
          {selectedTxLogs ? (
            <pre className={styles.logContent}>
              {selectedTxLogs.join('\n')}
            </pre>
          ) : (
            <p className={styles.logPlaceholder}>Click a transaction to view its logs. We are looking for "fill" or "trade" events.</p>
          )}
        </div>
      </div>
    </div>
  );
};