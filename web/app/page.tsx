"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet, Mail, Shield, CheckCircle } from "lucide-react";
import { WalletConnection } from "@/components/wallet-connection";
import { EmailForm } from "@/components/email-form";
import { EmailDashboard } from "@/components/email-dashboard";
import { TransactionHistory } from "@/components/transaction-history";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [activeTab, setActiveTab] = useState("compose");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">LexProof</h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Decentralized email verification using vlayer technology. Send
            authenticated emails with on-chain proof of delivery.
          </p>
        </div>

        {/* Wallet Connection Status */}
        <div className="flex justify-center mb-8">
          <WalletConnection
            onConnect={setIsConnected}
            onAddressChange={setWalletAddress}
          />
        </div>

        {/* Main Content */}
        {!isConnected ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <Wallet className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Connect Your Wallet</CardTitle>
                <CardDescription>
                  Connect your crypto wallet to start sending verified emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">
                      Email authenticity verification
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">On-chain proof storage</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Delivery tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="max-w-4xl mx-auto"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="compose" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Compose Email
              </TabsTrigger>
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                Transactions history
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="mt-6">
              <EmailForm walletAddress={walletAddress} />
            </TabsContent>

            <TabsContent value="dashboard" className="mt-6">
              <EmailDashboard />
            </TabsContent>

            <TabsContent value="transactions" className="mt-6">
              <div className="flex justify-center">
                <TransactionHistory
                  address={walletAddress}
                  chainId={1}
                  title="Wallet Transaction History"
                  description="View all transactions associated with your connected wallet address. This includes email verification transactions and other blockchain activity."
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}