"use client"

import type React from "react"
import { TransactionPopupProvider } from "@blockscout/app-sdk"

export function Providers({ children }: { children: React.ReactNode }) {
  return <TransactionPopupProvider>{children}</TransactionPopupProvider>
}
