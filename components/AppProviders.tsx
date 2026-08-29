"use client";

import type { ReactNode } from "react";
import { WalletProvider } from "@/components/wallet";

export function AppProviders({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
