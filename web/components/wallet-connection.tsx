"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransactionHistory } from "@/components/transaction-history";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { CustomConnectButton } from "./custom-connect-button";
import { Skeleton } from "./ui/skeleton";

interface WalletConnectionProps {
  onConnect: (connected: boolean) => void;
  onAddressChange: (address: string) => void;
}

export function WalletConnection({
  onConnect,
  onAddressChange,
}: WalletConnectionProps) {
  const { address, isConnected, isConnecting } = useAccount();
  const { toast } = useToast();

  // Efecto para sincronizar el estado con el exterior
  useEffect(() => {
    onConnect(isConnected);
    if (isConnected && address) {
      onAddressChange(address);
    } else {
      onAddressChange("");
    }
  }, [isConnected, address]);

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ConnectButton
          label="Connect Wallet"
          accountStatus="address" // o "address" o "avatar" o "full"
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="flex items-center gap-2 px-3 py-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Connected
        </Badge>
        <CustomConnectButton />
      </div>
    </div>
  );
}