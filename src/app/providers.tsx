"use client"; // <-- 1. This is a Client Component

import type { ReactNode } from "react";
import { FogoSessionProvider, Network } from "@fogo/sessions-sdk-react";
import { NATIVE_MINT } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// 2. Create the PublicKey object safely inside the Client Component
// --- THIS IS THE FIX ---
// The paymaster error log told us the *expected* sponsor key.
const sponsorPubKey = new PublicKey("3gqB8sf1NcnyGaAwpgCU3DPC1WSnmix6dWvmQAiYkdxv");

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    // 3. All provider logic now lives here
    <FogoSessionProvider
      network={Network.Testnet}
      sponsor={sponsorPubKey}
      domain="https://sessions-example.fogo.io"
      tokens={[NATIVE_MINT.toBase58(), "fUSDNGgHkZfwckbr5RLLvRbvqvRcTLdH9hcHJiq4jry"]}
      defaultRequestedLimits={{
        [NATIVE_MINT.toBase58()]: 1_500_000_000n,
        "fUSDNGgHkZfwckbr5RLLvRbvqvRcTLdH9hcHJiq4jry": 1_000_000_000n
      }}
      enableUnlimited
    >
      {/* 4. The layout components are moved here so they 
             can also access the session context */}
      <Navbar />
      <hr />
      <main>
        {children}
      </main>
      <Footer />
    </FogoSessionProvider>
  );
}

