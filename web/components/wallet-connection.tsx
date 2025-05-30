"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransactionHistory } from "@/components/transaction-history";

interface WalletConnectionProps {
  isConnected: boolean;
  walletAddress: string;
  onConnect: (connected: boolean) => void;
  onAddressChange: (address: string) => void;
}

export function WalletConnection({
  isConnected,
  walletAddress,
  onConnect,
  onAddressChange,
}: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connectWallet = async () => {
    setIsConnecting(true);

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        toast({
          title: "MetaMask not found",
          description: "Please install MetaMask to continue",
          variant: "destructive",
        });
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        onAddressChange(address);
        onConnect(true);

        toast({
          title: "Wallet connected",
          description: "Successfully connected to MetaMask",
        });
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection failed",
        description: "Failed to connect to wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    onConnect(false);
    onAddressChange("");
    toast({
      title: "Wallet disconnected",
      description: "Successfully disconnected from wallet",
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    });
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          size="lg"
          className="flex items-center gap-2"
        >
          <Wallet className="h-5 w-5" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
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

        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border">
          <span className="text-sm font-mono">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAddress}
            className="h-6 w-6 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>

        <Button variant="outline" onClick={disconnectWallet}>
          Disconnect
        </Button>
      </div>
    </div>
  );
}
