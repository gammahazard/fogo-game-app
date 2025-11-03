"use client"; // This component must be a client component

import type { ReactNode } from "react";
import { FogoSessionProvider, Network } from "@fogo/sessions-sdk-react";
import { NATIVE_MINT } from "@solana/spl-token";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// This is the FogoSessionProvider setup from your original,
// locally-working layout.tsx file.
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <FogoSessionProvider
      network={Network.Testnet}
      domain={process.env.NODE_ENV === "production" ? undefined : "https://sessions-example.fogo.io"}
      tokens={[NATIVE_MINT.toBase58(), "fUSDNGgHkZfwckbr5RLLvRbvqvRcTLdH9hcHJiq4jry"]}
      defaultRequestedLimits={{
        [NATIVE_MINT.toBase58()]: 1_500_000_000n,
        "fUSDNGgHkZfwckbr5RLLvRbvqvRcTLdH9hcHJiq4jry": 1_000_000_000n
      }}
      enableUnlimited
    >
      {/* The Navbar and Footer are inside the provider 
          so they can also use the session state */}
      <Navbar />
      <hr />
      <main>
        {children}
      </main>
      <Footer />
    </FogoSessionProvider>
  );
}

