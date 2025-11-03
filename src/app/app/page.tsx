"use client"

import { useState } from 'react';
import { GameCard } from '@/components/game/GameCard';
import { GameModal } from '@/components/game/GameModal';
import styles from './page.module.css';

// --- 1. Import the session hooks ---
import { useSession, isEstablished } from "@fogo/sessions-sdk-react";

// Mock data for our placeholder games
const games = [
  {
    id: 1,
    title: 'Fogo Flappy Bird',
    description: 'Flap your way to the moon, earning $FOGO on the way.',
    imageUrl: '/logo.jpg', // <-- Use local logo
    content: 'This is the full game modal for Fogo Flappy Bird. Imagine a game canvas here! You could interact with it, and all transactions (like spending 1 $FOGO to play) would be handled by your session in the background.'
  },
  {
    id: 2,
    title: 'Solana Speedster',
    description: 'Race against other players in a high-speed futuristic city.',
    imageUrl: '/logo.jpg', // <-- Use local logo
    content: 'Welcome to Solana Speedster! Your session wallet holds your NFT car and your $FUSD for bets. All gas-free. Ready to race?'
  },
  {
    id: 3,
    title: 'Crypto Clicker',
    description: 'Click to earn! A simple, addictive game of accumulation.',
    imageUrl: '/logo.jpg', // <-- Use local logo
    content: 'You have clicked 0 times. Each click will eventually mint an item to your session wallet.'
  },
];

type Game = typeof games[0] | null;

export default function App() {
  const [modalGame, setModalGame] = useState<Game>(null);
  
  // --- 2. Get the session state ---
  const sessionState = useSession();
  const established = isEstablished(sessionState);

  const handleCardClick = (game: Game) => {
    setModalGame(game);
  };

  const handleCloseModal = () => {
    setModalGame(null);
  };

  // --- 3. Check if the user is signed in ---
  if (!established) {
    return (
      <div className={styles.container}>
        <div className={styles.notSignedIn}>
          Please sign in to start playing
        </div>
      </div>
    );
  }

  // --- 4. If signed in, show the games ---
  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>Game Hub</h1>
        <p className={styles.subtitle}>Select a game to launch it.</p>

        <div className={styles.gameGrid}>
          {games.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              imageUrl={game.imageUrl}
              onClick={() => handleCardClick(game)}
            />
          ))}
        </div>
      </div>

      <GameModal 
        isOpen={!!modalGame} 
        onClose={handleCloseModal} 
        title={modalGame?.title || ''}
      >
        <p>{modalGame?.content}</p>
      </GameModal>
    </>
  );
}

