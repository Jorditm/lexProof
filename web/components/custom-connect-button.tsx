"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown, CopyIcon, LogOut, Wallet } from "lucide-react";
import { useDisconnect } from "wagmi";
import { toast } from "sonner";

export function CustomConnectButton() {
  const { disconnect } = useDisconnect();

  const copyAddress = (address: string) => {
    if (
      typeof window !== "undefined" &&
      navigator?.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      navigator.clipboard.writeText(address);
      toast("Wallet address copied to clipboard");
    } else {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = address;
      textarea.style.position = "fixed"; // evita scroll
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        const successful = document.execCommand("copy");
        toast(successful ? "Wallet address copied" : "Copy failed");
      } catch (err) {
        toast("Copy not supported");
      }

      document.body.removeChild(textarea);
    }
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!ready) return null;

        if (!connected) {
          return (
            <Button onClick={openConnectModal} size="sm" className="gap-2">
              Connect Wallet
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Button onClick={openChainModal} variant="destructive" size="sm">
              Wrong Network
            </Button>
          );
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 px-4 w-[160px]"
              >
                <span className="text-sm font-mono">{account.displayName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="justify-between pr-2 pl-3 w-[--radix-dropdown-menu-trigger-width]">
                <span className="truncate font-mono">
                  {account.displayName}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // evita que se cierre el menú
                    copyAddress(account.address);
                  }}
                  className="p-1 rounded hover:bg-muted transition"
                >
                  <CopyIcon className="w-4 h-4" />
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => disconnect()}
                className="text-red-600 focus:text-red-700 flex items-center justify-between"
              >
                Disconnect
                <LogOut className="w-4 h-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }}
    </ConnectButton.Custom>
  );
}
