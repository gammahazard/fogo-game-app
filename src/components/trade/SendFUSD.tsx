"use client"

import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { ExampleProgram } from "@fogo/sessions-idls";
import { TransactionResult } from "@fogo/sessions-sdk";
import { useSession, type EstablishedSessionState, isEstablished, useConnection } from "@fogo/sessions-sdk-react";
import { getAssociatedTokenAddressSync, getMint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useState } from "react";
// We reuse the same styles for a consistent look
import styles from './TradeModule.module.css'; 

// --- CHANGE 1: Define the fUSD Mint Address ---
const fUSDMint = new PublicKey("fUSDNGgHkZfwckbr5RLLvRbvqvRcTLdH9hcHJiq4jry");

// Renamed the component to avoid conflicts
export const SendFUSDModule = () => {
  const sessionState = useSession();
  if (isEstablished(sessionState)) {
    return <SendFUSDButton sessionState={sessionState} />
  } else {
    // We can show a slightly different message or the same one
    return <p className={styles.notEstablished}>Please sign in to donate fUSD</p>;
  }
}

const SendFUSDButton = ({ sessionState }: { sessionState: EstablishedSessionState }) => {
  // --- CHANGE 2: Set amount to 5 and use fUSDMint ---
  const { state, execute } = useTrade(sessionState, 5, fUSDMint);
  const isRunning = state.type === StateType.Running;

  return (
    <button 
      onClick={execute} 
      disabled={isRunning}
      className={styles.tradeButton} // Reusing the same style
    >
      {/* --- CHANGE 3: Update button text --- */}
      {isRunning ? "Donating..." : "donate 5 fUSD to me :D"}
    </button>
  );
}

// This is the same donation address as before
const newDestinationOwner = new PublicKey("HfjgojRDssThMJAwLdqjAErB4XjWtypipcvGoGAvPHeB");

// The useTrade hook is identical, it's generic!
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