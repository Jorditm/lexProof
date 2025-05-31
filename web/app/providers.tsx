"use client";

import type React from "react";
<<<<<<< HEAD
import { TransactionPopupProvider } from "@blockscout/app-sdk";
=======
import {
  TransactionPopupProvider,
  NotificationProvider,
} from "@blockscout/app-sdk";
>>>>>>> ca238ce5de251338fcbb3f683989d10a2ef823c4
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { sepolia } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "Lexproof",
  projectId: "9e4b3d07449fc2c085734283f99da77e",
  chains: [sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TransactionPopupProvider>
<<<<<<< HEAD
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
=======
      <NotificationProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>{children}</RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </NotificationProvider>
>>>>>>> ca238ce5de251338fcbb3f683989d10a2ef823c4
    </TransactionPopupProvider>
  );
}
