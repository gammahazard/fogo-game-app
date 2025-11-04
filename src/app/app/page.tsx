"use client"; // This page must be client-side to check session and manage modals

import { useState } from "react";
import { useSession, isEstablished } from "@fogo/sessions-sdk-react";

// 1. Import all your components
import { AppCard } from "@/components/ecosystem-apps/AppCard";
import { AppModal } from "@/components/ecosystem-apps/AppModal";
import { BalanceDisplay } from "@/components/trade/Balance";
import { AmbientStatsDisplay } from "@/components/ecosystem-apps/AmbientStatsDisplay";

// === 2. IMPORT THE NEW COMPONENT ===
import { WalletTransactionViewer } from "@/components/ecosystem-apps/WalletTransactionViewer"; 

// 3. Import your CSS
import styles from "./page.module.css";

// 4. Define your app data
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

      {/* Render the AppModal */}
      {selectedApp && (
        <AppModal app={selectedApp} onClose={() => setSelectedApp(null)}>
          
          {selectedApp.id === 'ambient' ? (
            <div>
              {/* Component for CURRENT position stats */}
              <AmbientStatsDisplay />
              
              {/* === 3. USE THE NEW COMPONENT === */}
              {/* This replaces AmbientHistory */}
              <WalletTransactionViewer />
            </div>
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