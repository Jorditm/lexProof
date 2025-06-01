"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, ExternalLink, Copy, Trash2, Eye, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { toast } from "sonner";
import { useAccount, useReadContracts } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";

interface Email {
  id: string;
  to: string;
  subject: string;
  message: string;
  from: string;
  timestamp: string;
  status: "sent" | "delivered" | "opened" | "verified";
  txHash: string;
}

export function EmailDashboard() {
  const queryClient = useQueryClient();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { address } = useAccount();

  const {
    data: emails,
    refetch: refetchEmails,
    isFetching: isFetchingEmails,
  } = useQuery({
    queryKey: ["combinedEmails", address],
    queryFn: async () => {
      if (!address) return [];

      const response = await fetch("/api/content/get-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: address,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch emails from API");
      const emailsData = await response.json();

      return emailsData.map((email: any) => ({
        id: email.id,
        to: email.recipient,
        subject: email.subject,
        message: email.content,
        from: email.sender,
        timestamp: email.timestamp || new Date().toISOString(),
        status: email.status || "sent",
        txHash: email.txhash || "",
      } as Email));
    },

    enabled: Boolean(address),
    staleTime: 0,
  });

  const userContract = {
    address: address,
    abi: [],
  } as const;

  const result = useReadContracts({
    contracts: [
      {
        ...userContract,
        functionName: "",
      },
    ],
  });
  const getStatusBadge = (status: string, txHash?: string) => {
    if (!txHash) {
      return (
        <Badge
          variant="secondary"
          className="bg-orange-100 text-orange-800 hover:bg-orange-100"
        >
          Pending NFT
        </Badge>
      );
    }

    return (
      <Badge
        variant="default"
        className="bg-green-100 text-green-800 hover:bg-green-100"
      >
        Sent
      </Badge>
    );
  };

  const copyTxHash = (txHash: string) => {
    navigator.clipboard.writeText(txHash);
    toast("Transaction hash copied");
  };

  const previewEmail = (email: Email) => {
    setSelectedEmail(email);
    setPreviewOpen(true);
  };

  const truncateText = (text: string, maxLength: number) => {
    return text?.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes())
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Dashboard
              </CardTitle>
              <CardDescription>
                Track your sent emails and their verification status
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto mt-2"
              onClick={() => refetchEmails()}
              disabled={isFetchingEmails}
            >
              {isFetchingEmails ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isFetchingEmails ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : emails?.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No emails sent yet</p>
              <p className="text-sm text-slate-500">
                Send your first verified email to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  {emails?.length} email
                  {emails?.length !== 1 ? "s" : ""} sent
                </p>
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Tx Hash</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails?.map((email: any) => (
                      <TableRow key={email?.id}>
                        <TableCell className="font-medium">
                          {email?.to}
                        </TableCell>
                        <TableCell>
                          {truncateText(email?.subject, 30)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(email?.status, email?.txHash)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatTimestamp(email.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">
                              {email?.txHash?.slice(0, 8)}...
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyTxHash(email?.txHash)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link href={`/proof/${email?.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                title="View Public Proof"
                              >
                                <Shield className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => previewEmail(email)}
                              className="h-6 w-6 p-0"
                              title="Preview Email"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `https://etherscan.io/tx/${email?.txHash}`,
                                  "_blank"
                                )
                              }
                              className="h-6 w-6 p-0"
                              title="View on Etherscan"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        {selectedEmail && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedEmail.subject}</DialogTitle>
              <DialogDescription>
                Sent to {selectedEmail.to} on{" "}
                {formatTimestamp(selectedEmail.timestamp)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <div>
                  From: {selectedEmail.from.slice(0, 6)}...
                  {selectedEmail.from.slice(-4)}
                </div>
                <div>
                  {getStatusBadge(selectedEmail.status, selectedEmail.txHash)}
                </div>
              </div>
              <div className="border-t pt-4">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.message }}
                />
              </div>
              <div className="border-t pt-4 flex justify-between items-center text-xs text-slate-500">
                <div>
                  Transaction:{" "}
                  {selectedEmail.txHash.slice(0, 10)}...
                  {selectedEmail.txHash.slice(-8)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
