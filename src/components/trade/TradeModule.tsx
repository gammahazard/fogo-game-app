"use client"

import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { ExampleProgram } from "@fogo/sessions-idls";
import { TransactionResult } from "@fogo/sessions-sdk";
import { useSession, type EstablishedSessionState, isEstablished, useConnection } from "@fogo/sessions-sdk-react";
import { getAssociatedTokenAddressSync, NATIVE_MINT, getMint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useState } from "react";
import styles from './TradeModule.module.css';

// This is the main component you'll import into your page
export const TradeModule = () => {
  const sessionState = useSession();
  if (isEstablished(sessionState)) {
    return <TradeButton sessionState={sessionState} />
  } else {
    // Apply style for "not established"
    // THIS IS THE LINE YOU WANTED TO CHANGE:
    return <p className={styles.notEstablished}>Please sign in to continue</p>;
  }
}

// All of your existing logic from page.tsx goes here:
const TradeButton = ({ sessionState }: { sessionState: EstablishedSessionState }) => {
  // The amount is passed in here (was 0.001, now 0.5)
  const { state, execute } = useTrade(sessionState, 0.5, NATIVE_MINT);
  const isRunning = state.type === StateType.Running;

  return (
    <button 
      onClick={execute} 
      disabled={isRunning}
      className={styles.tradeButton} 
    >
      {/* The button text is here */}
      {isRunning ? "Donating..." : "donate 0.5 fogo to me :D"}
    </button>
  );
}

// Define the new destination wallet address
const newDestinationOwner = new PublicKey("AFgeLJBG9db7qoNpEsaRKxAFLdvV4Dw17KrsWatxGpug");

const useTrade = (
  sessionState: EstablishedSessionState,
  amount: number,
  mint: PublicKey,
) => {
  const [state, setState] = useState<State>(State.Base());
  const connection = useConnection();

  const execute = useCallback(() => {
    if (state.type === StateType.Running) {
      throw new AlreadyInProgressError();
    }
    setState(State.Running());
    getMint(connection, mint)
      .then(({ decimals }) => (
        new ExampleProgram(
          new AnchorProvider(connection, {} as Wallet, {}),
        ).methods
          .exampleTransfer(new BN(amount * Math.pow(10, decimals)))
          .accountsPartial({
            signerOrSession: sessionState.sessionPublicKey,
            
            // Set the 'sink' to the new address's token account
            sink: getAssociatedTokenAddressSync(mint, newDestinationOwner),

            userTokenAccount: getAssociatedTokenAddressSync(
              mint,
              sessionState.walletPublicKey,
            ),
            mint,
          })
          .instruction()
      ))
      .then((instruction) => sessionState.sendTransaction([instruction]))
      .then((result) => setState(State.Complete(result)))
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.error(error);
        setState(State.ErrorState(error));
        throw error;
      });
  }, [state, sessionState, amount, mint, setState, connection]);

  return { state, execute };
};

// --- State Management (unchanged) ---

enum StateType {
  Base,
  Running,
  Error,
  Complete,
}

const State = {
  Base: () => ({ type: StateType.Base as const }),
  Running: () => ({ type: StateType.Running as const }),
  Complete: (result: TransactionResult) => ({ type: StateType.Complete as const, result }),
  ErrorState: (error: unknown) => ({
    type: StateType.Error as const,
    error,
  }),
};
type State = ReturnType<typeof State[keyof typeof State]>;

class AlreadyInProgressError extends Error {
  constructor() {
    super("Can't run async hook when already in progress");
    this.name = "AlreadyInProgressError";
  }
}