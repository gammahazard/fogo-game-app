//@ts-nocheck

"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession, isEstablished, useConnection } from "@fogo/sessions-sdk-react";
import { PublicKey, SignatureInfo, TransactionResponse } from "@solana/web3.js";
import styles from './WalletTransactionViewer.module.css';

// The Ambient Program ID we are testing
const AMBIENT_PROGRAM_ID = new PublicKey("ambi3LHRUzmU187u4rP46rX6wrYrLtU1Bmi5U2yCTGE");
const TX_PER_PAGE = 10;

export const WalletTransactionViewer = () => {
  const sessionState = useSession();
  const connection = useConnection();
  const established = isEstablished(sessionState);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for ALL signatures
  const [signatures, setSignatures] = useState<SignatureInfo[]>([]);
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // Cache for fetched transactions
  const [transactionCache, setTransactionCache] = 
    useState<Record<string, TransactionResponse | null>>({});

  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [txToInspect, setTxToInspect] = useState<TransactionResponse | null>(null);

  // --- PAGINATION LOGIC (MOVED TO TOP) ---
  // This logic now runs *before* any return statements
  const totalPages = Math.ceil(signatures.length / TX_PER_PAGE);
  
  const paginatedSignatures = useMemo(() => {
    const startIndex = (currentPage - 1) * TX_PER_PAGE;
    const endIndex = startIndex + TX_PER_PAGE;
    return signatures.slice(startIndex, endIndex);
  }, [signatures, currentPage]);

  // --- Data Fetching ---

  // 1. Fetch ALL signatures on component mount (runs once)
  useEffect(() => {
    if (!established) return;

    const fetchAllSignatures = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching all signatures...");
        const sigs = await connection.getSignaturesForAddress(
          sessionState.walletPublicKey,
          { limit: 100 } // Get last 100
        );
        if (sigs.length === 0) setError("No transaction history found.");
        setSignatures(sigs);
      } catch (err: any) {
        console.error("Failed to fetch history:", err);
        setError("An error occurred while fetching history.");
      }
      setIsLoading(false);
    };
    fetchAllSignatures();
  }, [established, sessionState, connection]); // Runs only on initial load

  // 2. Fetch full details ONLY for the current page (and only if not in cache)
  useEffect(() => {
    // Check if paginatedSignatures has content AND connection is available
    if (paginatedSignatures.length === 0 || !connection) return;

    const fetchTransactionDetails = async () => {
      setIsFetchingDetails(true);
      
      const sigsToFetch = paginatedSignatures
        .map(s => s.signature)
        .filter(sig => transactionCache[sig] === undefined); // Check if not in cache
      
      if (sigsToFetch.length > 0) {
        console.log(`Fetching details for ${sigsToFetch.length} new txs on page ${currentPage}`);
        try {
          const txs = await connection.getTransactions(sigsToFetch, {
            maxSupportedTransactionVersion: 0,
          });

          const newCacheEntries: Record<string, TransactionResponse | null> = {};
          txs.forEach((tx, index) => {
            const sig = sigsToFetch[index];
            newCacheEntries[sig] = tx;
          });

          setTransactionCache(prevCache => ({
            ...prevCache,
            ...newCacheEntries,
          }));

        } catch (e) {
          console.error("Failed to fetch tx details:", e);
          setError("Failed to load transaction details.");
        }
      } else {
        console.log(`Page ${currentPage} data loaded from cache.`);
      }

      setIsFetchingDetails(false);
    };

    fetchTransactionDetails();
  }, [paginatedSignatures, connection, transactionCache]); // Re-run when page changes or connection is ready


  // --- Render Logic ---

  if (isLoading) {
    return <div className={styles.loading}>Loading transaction history...</div>;
  }
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  // If "Inspect" is clicked, show the modal
  if (txToInspect) {
    const ourWallet = sessionState.walletPublicKey.toBase58();
    const otherAccounts = txToInspect.transaction.message.accountKeys
      .map(k => k.toBase58())
      .filter(k => k !== ourWallet);

    return (
      <div className={styles.inspectModal}>
        <button onClick={() => setTxToInspect(null)} className={styles.closeButton}>
          &times; Close Inspector
        </button>
        <h3>Inspecting TX: {txToInspect.transaction.signatures[0].substring(0, 20)}...</h3>
        
        <div className={styles.inspectSection}>
          <h4>Other Accounts Involved (Look for a new one!)</h4>
          <pre>
            {otherAccounts.join('\n')}
          </pre>
        </div>
        
        <div className={styles.inspectSection}>
          <h4>Transaction Logs (Look for "deposit", "CMA", or fUSD)</h4>
          <pre>
            {txToInspect.meta?.logMessages?.join('\n')}
          </pre>
        </div>
      </div>
    );
  }

  // Main transaction list view
  return (
    <div className={styles.viewerContainer}>
      <h4 className={styles.title}>All Recent Transactions</h4>
      <p className={styles.instructions}>
        Find your Ambient "deposit" transaction, it should be highlighted.
      </p>

      {isFetchingDetails ? (
        <div className={styles.loading}>Loading page {currentPage}...</div>
      ) : (
        <ul className={styles.txList}>
          {paginatedSignatures.map((sigInfo) => {
            const tx = transactionCache[sigInfo.signature];
            
            if (tx === undefined) {
              return <li key={sigInfo.signature} className={styles.txItem}>Loading...</li>;
            }
            if (tx === null) {
              return <li key={sigInfo.signature} className={styles.txItem}>Error loading tx</li>;
            }

            const isAmbient = tx.meta?.logMessages?.some(log => 
              log.includes(AMBIENT_PROGRAM_ID.toBase58())
            ) || false;

            return (
              <li 
                key={sigInfo.signature} 
                className={`${styles.txItem} ${isAmbient ? styles.highlight : ''}`}
              >
                <span className={styles.sig}>
                  {new Date(sigInfo.blockTime! * 1000).toLocaleString()}
                  <br />
                  {sigInfo.signature.substring(0, 30)}...
                </span>
                <div className={styles.buttonGroup}>
                  <a 
                    href={`https://fogoscan.com/tx/${sigInfo.signature}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.fogoscanLink}
                  >
                    Fogoscan
                  </a>
                 
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination Controls */}
      <div className={styles.pagination}>
        <button 
          onClick={() => setCurrentPage(p => p - 1)} 
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(p => p + 1)} 
          disabled={currentPage === totalPages || signatures.length === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
};