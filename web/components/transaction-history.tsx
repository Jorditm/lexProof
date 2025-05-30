"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTransactionPopup } from "@blockscout/app-sdk";
import { History, ExternalLink, Wallet } from "lucide-react";

interface TransactionHistoryProps {
  address?: string;
  chainId?: number;
  title?: string;
  description?: string;
}

export function TransactionHistory({
  address,
  chainId = 1, // Default to Ethereum mainnet
  title = "Transaction History",
  description,
}: TransactionHistoryProps) {
  const { openTransactionPopup } = useTransactionPopup();

  const handleOpenHistory = () => {
    try {
      openTransactionPopup({
        address: address || undefined,
        chainId,
        // Additional options can be configured here
        theme: "light",
        width: 800,
        height: 600,
      });
    } catch (error) {
      console.error("Failed to open transaction popup:", error);
    }
  };

  const getChainName = (chainId: number) => {
    const chains: Record<number, string> = {
      1: "Ethereum",
      137: "Polygon",
      56: "BSC",
      42161: "Arbitrum",
      10: "Optimism",
      100: "Gnosis",
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const defaultDescription = address
    ? `View the complete transaction history for wallet ${formatAddress(
        address
      )} on ${getChainName(chainId)}.`
    : `View all recent transactions on the ${getChainName(chainId)} network.`;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {description || defaultDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address and Chain Info */}
        <div className="space-y-2">
          {address && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                Address:
              </span>
              <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                {formatAddress(address)}
              </code>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Network:</span>
            <Badge variant="outline" className="text-xs">
              {getChainName(chainId)}
            </Badge>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleOpenHistory}
          className="w-full flex items-center gap-2"
          size="sm"
        >
          <ExternalLink className="h-4 w-4" />
          View Transaction History
        </Button>

        {/* Additional Info */}
        <div className="text-xs text-slate-500 text-center pt-2 border-t">
          Powered by Blockscout Explorer
        </div>
      </CardContent>
    </Card>
  );
}
