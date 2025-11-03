//@ts-nocheck
"use client"; // This file is a Client Component

import type { ReactNode } from "react";
import { FogoSessionProvider, Network } from "@fogo/sessions-sdk-react";
import { NATIVE_MINT } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// --- THIS IS THE FULL FIX ---

// 1. This is the CORRECT sponsor key from your last error log
const sponsorPubKey = new PublicKey("3gqB8sf1NcnyGaAwpgCU3DPC1WSnmix6dWvmQAiYkdxv");

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FogoSessionProvider
      network={Network.Testnet}
      
      // 2. Add the required props
      sponsor={sponsorPubKey}
      paymasterUrl="https://sessions-example.fogo.io/paymaster"
      
      // 3. Set the domain to the ONE this test paymaster is
      //    registered to accept, as shown in the example app.
      domain="https://sessions-example.fogo.io"
      
      tokens={[NATIVE_MINT.toBase58(), "fUSDNGgHkZfwckbr5RLLvRbvqvRcTLdH9hcHJiq4jry"]}
      defaultRequestedLimits={{
        [NATIVE_MINT.toBase58()]: 1_500_000_000n,
        "fUSDNGgHkZfwckbr5RLLvRbvqvRcTLdH9hcHJiq4jry": 1_000_000_000n
      }}
      enableUnlimited
    >
      <Navbar />
      <hr />
      <main>
        {children}
      </main>
      <Footer />
    </FogoSessionProvider>
  );
}

