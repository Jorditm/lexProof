"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  ExternalLink,
  Mail,
  Calendar,
  Hash,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, FileImage, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { getEmailNfts } from "@/lib/alchemy";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

interface EmailProof {
  id: string;
  senderAddress: string;
  recipientEmail: string;
  contentHash: string;
  subject: string;
  dateSent: string;
  txHash: string;
  blockNumber: number;
  verified: boolean;
}

export default function ProofPage() {
  const params = useParams();
  const hash = params.hash as string;
  const account = useAccount();

  const generateContentHash = (content: string) => {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(32, "0");
  };

  const {
    data: proof,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["emailProof", hash],
    queryFn: async () => {
      if (!hash) return null;
      const res = await fetch("/api/content/get-email-by-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: hash }),
      });
      if (!res.ok) throw new Error("Failed to fetch email proof");
      const data = await res.json();
      if (!data || !data[0]) return null;
      const email = data[0];
      return {
        id: email.id,
        senderAddress: email.sender,
        recipientEmail: email.recipient,
        contentHash: email.content_hash || generateContentHash(email.content),
        subject: email.subject,
        dateSent: email.date_sent || new Date().toISOString(),
        txHash: email.txhash || "",
        verified: true,
      };
    },
  });

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const getBlockscoutUrl = (txHash: string) => {
    // Using Ethereum mainnet Blockscout for demo
    return `https://eth.blockscout.com/tx/${txHash}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !proof) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="h-8 w-8 text-red-600" />
                <h1 className="text-3xl font-bold text-slate-900">
                  Email Proof Not Found
                </h1>
              </div>
              <p className="text-slate-600">
                The requested email proof could not be found or verified.
              </p>
            </div>

            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">
                  {error &&
                    "This proof hash does not exist or the email has not been verified on the blockchain."}
                </p>
                <Link href="/">
                  <Button>Return to Home</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const downloadAsPNG = async () => {
    const element = document.getElementById("proof-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.download = `email-proof-${hash.slice(0, 8)}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
    }
  };

  const downloadAsPDF = async () => {
    const element = document.getElementById("proof-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`email-proof-${hash.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-slate-900">
                Email Proof Verification
              </h1>
            </div>
            <p className="text-slate-600">
              Blockchain-verified email authenticity and delivery proof
            </p>
          </div>

          {/* Download Actions */}
          <div className="flex justify-center mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Proof
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={downloadAsPNG}
                  className="flex items-center gap-2"
                >
                  <FileImage className="h-4 w-4" />
                  Download as PNG
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={downloadAsPDF}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Downloadable Content */}
          <div id="proof-content" className="bg-white p-8 rounded-lg shadow-sm">
            {/* Verification Status */}
            <div className="flex justify-center mb-6">
              <Badge
                variant="outline"
                className={`flex items-center gap-2 px-4 py-2 text-sm ${
                  proof.verified
                    ? proof.txHash
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-orange-50 text-orange-700 border-orange-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {proof.verified ? (
                  proof.txHash ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {proof.verified ? (
                  proof.txHash ? (
                    "Verified on Blockchain"
                  ) : (
                    "Pending Blockchain verification"
                  )
                ) : (
                  "Verification Failed"
                )}
              </Badge>
            </div>

            {/* Proof Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Proof Details
                </CardTitle>
                <CardDescription>
                  This email has been cryptographically verified and recorded on
                  the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  {/* Sender Address */}
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-slate-700">
                        Sender Wallet Address
                      </p>
                      <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono break-all">
                        {proof.senderAddress}
                      </code>
                    </div>
                  </div>

                  {/* Recipient Email */}
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-slate-700">
                        Recipient Email
                      </p>
                      <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                        {proof.recipientEmail}
                      </code>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-slate-700">
                        Email Subject
                      </p>
                      <p className="text-sm text-slate-600">{proof.subject}</p>
                    </div>
                  </div>

                  {/* Content Hash */}
                  <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-slate-700">
                        Content Hash
                      </p>
                      <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono break-all">
                        {proof.contentHash}
                      </code>
                      <p className="text-xs text-slate-500">
                        SHA-256 hash of the email content
                      </p>
                    </div>
                  </div>

                  {/* Date Sent */}
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-slate-700">
                        Date Sent
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatDate(proof.dateSent)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Blockchain Details */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">
                    Blockchain Verification
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Transaction Hash:</span>
                      <code className="font-mono text-xs break-all">
                        {proof.txHash}
                      </code>
                    </div>
                  </div>
                </div>

                {/* QR Code for Verification URL */}
                <div className="border-t pt-6 text-center">
                  <p className="text-xs text-slate-500 mb-2">
                    Verification URL
                  </p>
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded break-all">
                    {typeof window !== "undefined" ? window.location.href : ""}
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Footer for PDF */}
            <div className="text-center mt-6 pt-4 border-t">
              <p className="text-xs text-slate-500">
                Generated on {new Date().toLocaleString()} • LexProof -
                Blockchain Email Verification
              </p>
            </div>
          </div>

          {/* Interactive Elements (not included in download) */}
          <div className="mt-6 space-y-4">
            {/* View on Blockscout */}
            <Button asChild className="w-full">
              <a
                href={getBlockscoutUrl(proof.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Transaction on Blockscout
              </a>
            </Button>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-4">
                This proof is cryptographically secured and immutable on the
                blockchain
              </p>
              <Link href="/">
                <Button variant="outline">Return to LexProof</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
