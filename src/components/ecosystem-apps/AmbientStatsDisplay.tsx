"use client";

import { useState, useEffect } from "react";
import { useSession, isEstablished, useConnection } from "@fogo/sessions-sdk-react";
import * as ember from "@crocswap-libs/ambient-ember";
import type { MarginBucketAvail } from "@crocswap-libs/ambient-ember"; // Import the specific type
import styles from './AmbientStatsDisplay.module.css';

// Per the docs, 64n is the Market ID for BTC
const BTC_MARKET_ID = 64n;

// Helper to format BigInt USD values (10^6 scale)
const formatUsd = (val: bigint) => {
  return `$${(Number(val) / 1e6).toFixed(2)}`;
};

// Helper to format BigInt quantity values (10^8 scale)
const formatBtc = (val: bigint) => {
  return `${(Number(val) / 1e8).toFixed(6)} BTC`;
};

export const AmbientStatsDisplay = () => {
  const sessionState = useSession();
  const connection = useConnection();
  const established = isEstablished(sessionState);

  const [stats, setStats] = useState<MarginBucketAvail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!established) return;

    const fetchAmbientStats = async () => {
      setIsLoading(true);
      setError(null);
      setStats(null);

      try {
        // This is the key function from the docs
        const marginBucket = await ember.getUserMarginBucket(
          connection,
          sessionState.walletPublicKey,
          BTC_MARKET_ID,
          ember.USD_MINT // The SDK exports this constant
        );

        if (marginBucket) {
          setStats(marginBucket);
        } else {
          // This is a common case: the user has never traded on Ambient
          setError("No Ambient trading account (CMA) found for this wallet.");
        }
      } catch (err: any) {
        console.error("Failed to fetch Ambient stats:", err);
        if (err.message.includes('CMA account')) {
          setError("No Ambient trading account (CMA) found for this wallet.");
        } else {
          setError("An error occurred while fetching stats.");
        }
      }
      setIsLoading(false);
    };

    fetchAmbientStats();
  }, [established, sessionState, connection]);

  if (isLoading) {
    return <div className={styles.loading}>Loading Ambient Stats...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!stats) {
    return <div className={styles.loading}>No stats available.</div>;
  }

  // We have stats, let's display them
  const pnlColor = stats.unrealizedPnl > 0n 
    ? styles.positivePnl 
    : styles.negativePnl;

  return (
    <div className={styles.statsContainer}>
      <h4 className={styles.statsTitle}>BTC Market Position</h4>
      <div className={styles.statsGrid}>
        
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Net Position</span>
          <span className={styles.statValue}>{formatBtc(stats.netPosition)}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Avg. Entry Price</span>
          <span className={styles.statValue}>{formatUsd(stats.avgEntryPrice)}</span>
        </div>

        <div className={styles.statBox}>
          <span className={styles.statLabel}>Equity</span>
          <span className={styles.statValue}>{formatUsd(stats.equity)}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Unrealized P&L</span>
          <span className={`${styles.statValue} ${pnlColor}`}>
            {formatUsd(stats.unrealizedPnl)}
          </span>
        </div>
        
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Available to Buy</span>
          <span className={styles.statValue}>{formatUsd(stats.availToBuy)}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Available to Withdraw</span>
          <span className={styles.statValue}>{formatUsd(stats.availToWithdraw)}</span>
        </div>

      </div>
    </div>
  );
};