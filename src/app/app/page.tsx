"use client"; 

import { useState } from "react";
import { useSession, isEstablished } from "@fogo/sessions-sdk-react";

import { AppCard } from "@/components/ecosystem-apps/AppCard";
import { AppModal } from "@/components/ecosystem-apps/AppModal";
import { BalanceDisplay } from "@/components/trade/Balance";
// ... other imports

// 1. Import your new stats component
import { AmbientStatsDisplay } from "@/components/ecosystem-apps/AmbientStatsDisplay";

import styles from "./page.module.css";

const apps = [
  { 
    id: 'ambient', 
    title: 'Ambient', 
    imageUrl: '/ambient.svg', 
    description: 'View on-chain stats for the Ambient protocol.' 
  },
];

export default function App() {
  const sessionState = useSession();
  const established = isEstablished(sessionState);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  if (!established) {
    return (
      <div className={styles.signInMessage}>
        Please sign in to view the ecosystem
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <h1 className={styles.title}>Ecosystem Apps</h1>

      <div className={styles.dashboardSection}>
        <BalanceDisplay />
        <div className={styles.tradeButtonsContainer}>
          {/* ... */}
        </div>
      </div>

      <div className={styles.appGrid}>
        {apps.map((app) => (
          <AppCard
            key={app.id}
            title={app.title}
            imageUrl={app.imageUrl}
            onClick={() => setSelectedApp(app)}
          />
        ))}
      </div>

      {/* 2. Render the new component inside the modal */}
      {selectedApp && (
        <AppModal app={selectedApp} onClose={() => setSelectedApp(null)}>
          {/* This placeholder div is replaced.
            We only render the stats component if the selected app is 'ambient'
          */}
          {selectedApp.id === 'ambient' ? (
            <AmbientStatsDisplay />
          ) : (
            <div>
              <p>{selectedApp.description}</p>
              <p>Stats for this app are not yet available.</p>
            </div>
          )}
        </AppModal>
      )}
    </div>
  );
}