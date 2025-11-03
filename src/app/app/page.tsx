"use client"; // This page must be client-side to check session and manage modals

import { useState } from "react";
import { useSession, isEstablished } from "@fogo/sessions-sdk-react";
import { GameCard } from "@/components/game/GameCard";
import { GameModal } from "@/components/game/GameModal";
import styles from "./page.module.css";

// This is the data for your games
// It now uses your /logo.jpg as requested
// *** FIX: Added 'description' to each game object ***
const games = [
  { id: 'game1', title: 'Fogo Flapper', imageUrl: '/logo.jpg', description: 'Flap your way to victory in this fiery challenge.' },
  { id: 'game2', title: 'Solana Stacker', imageUrl: '/logo.jpg', description: 'Stack blocks to the moon and build your tower.' },
  { id: 'game3', title: 'Session Surfer', imageUrl: '/logo.jpg', description: 'Surf the session waves and dodge the obstacles.' },
];

export default function App() {
  const sessionState = useSession();
  const established = isEstablished(sessionState);

  const [selectedGame, setSelectedGame] = useState<any>(null);

  // Show a message if not signed in
  if (!established) {
    return (
      <div className={styles.signInMessage}>
        Please sign in to start playing
      </div>
    );
  }

  // Show the game grid if signed in
  return (
    <div className={styles.appContainer}>
      <h1 className={styles.title}>Choose Your Game</h1>
      <div className={styles.gameGrid}>
        {games.map((game) => (
          <GameCard
            key={game.id}
            title={game.title}
            imageUrl={game.imageUrl}
            // *** FIX: Passing the 'description' prop ***
            description={game.description} 
            onClick={() => setSelectedGame(game)}
          />
        ))}
      </div>

      {/* The Modal */}
      {/* This logic is correct. It passes the 'game' object. */}
      {selectedGame && (
        <GameModal game={selectedGame} onClose={() => setSelectedGame(null)}>
          {/* This is where your actual game component would go */}
          <iframe 
            src="https://example.com" // Placeholder for game URL
            width="100%" 
            height="100%" 
            style={{ border: 'none', borderRadius: '8px' }}
          />
        </GameModal>
      )}
    </div>
  );
}

