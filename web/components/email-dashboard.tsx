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
import { getEmailNfts } from "@/lib/alchemy";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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

  const account = useAccount();
  const { data: emails } = useQuery({
    queryKey: ["emailNfts"],
    queryFn: async () => {
      const data = await getEmailNfts(account.address as `0x${string})`);
      return data.ownedNfts;
    },
  });
  console.log("emails", emails);
  const userContract = {
    address: account.address,
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
  const getStatusBadge = (status: string) => {
    const variants = {
      sent: { variant: "secondary" as const, label: "Sent" },
      delivered: { variant: "default" as const, label: "Delivered" },
      opened: { variant: "default" as const, label: "Opened" },
      verified: { variant: "default" as const, label: "Verified" },
    };

    const config = variants[status as keyof typeof variants] || variants.sent;

    return (
      <Badge
        variant={config.variant}
        className={
          status === "verified"
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : status === "opened"
              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
              : status === "delivered"
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                : ""
        }
      >
        {config.label}
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

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number) => {
    return text?.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Dashboard
          </CardTitle>
          <CardDescription>
            Track your sent emails and their verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emails?.length === 0 ? (
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
                    {emails?.map((email) => (
                      <TableRow key={email?.id}>
                        <TableCell className="font-medium">
                          {email?.to}
                        </TableCell>
                        <TableCell>
                          {truncateText(email?.subject, 30)}
                        </TableCell>
                        <TableCell>{getStatusBadge(email?.status)}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatDate(email.mint?.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">
                              {email?.mint?.transactionHash?.slice(0, 8)}...
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyTxHash(email?.mint?.transactionHash)
                              }
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/proof/${email?.mint?.transactionHash}`}
                            >
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
                              onClick={() => previewEmail(email.recipient)}
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
                                  `https://etherscan.io/tx/${email.mint?.transactionHash}`,
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
                {formatDate(selectedEmail.timestamp)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <div>
                  From: {selectedEmail.from.slice(0, 6)}...
                  {selectedEmail.from.slice(-4)}
                </div>
                <div>{getStatusBadge(selectedEmail.status)}</div>
              </div>
              <div className="border-t pt-4">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.message }}
                />
              </div>
              <div className="border-t pt-4 flex justify-between items-center text-xs text-slate-500">
                <div>
                  Transaction: {selectedEmail.txHash.slice(0, 10)}...
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
