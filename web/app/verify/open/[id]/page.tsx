"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, ExternalLink, Mail, Clock, Shield, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

interface EmailVerification {
  id: string
  emailId: string
  subject: string
  recipientEmail: string
  senderAddress: string
  openedAt: string
  txHash?: string
  blockNumber?: number
  verified: boolean
  alreadyOpened: boolean
}

export default function EmailVerificationPage() {
  const params = useParams()
  const id = params.id as string
  const [verification, setVerification] = useState<EmailVerification | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { address } = useAccount()

  // React Query para obtener NFTs
  const { data: nftData, isLoading: nftLoading, error: nftError } = useQuery({
    queryKey: ["nfts", address],
    queryFn: async () => {
      if (!address) return null
      const res = await fetch(
        `https://eth-sepolia.blockscout.com/api/v2/addresses/${address}/nft?type=ERC-721`
      )
      if (!res.ok) throw new Error("Failed to fetch NFT data")
      return res.json()
    },
    enabled: !!address,
  })

  useEffect(() => {
    if (nftData) {
      // Aquí puedes adaptar la estructura según la respuesta real del endpoint
      setVerification({
        id: id,
        emailId: id,
        subject: "NFT Data",
        recipientEmail: "nft@example.com",
        senderAddress: address || "",
        openedAt: new Date().toISOString(),
        txHash: undefined,
        blockNumber: undefined,
        verified: true,
        alreadyOpened: false,
        // Puedes añadir más campos según la data de nftData
      })
      setLoading(false)
    }
    if (nftError) {
      setError("Error fetching NFT data")
      setLoading(false)
    }
  }, [nftData, nftError, address, id])

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    })
  }

  const getBlockscoutUrl = (txHash: string) => {
    return `https://eth.blockscout.com/tx/${txHash}`
  }

  const maskEmail = (email: string) => {
    const [username, domain] = email.split("@")
    if (username.length <= 2) return `${username}@${domain}`
    return `${username.slice(0, 2)}${"*".repeat(username.length - 2)}@${domain}`
  }

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
                <div className="text-center">
                  <Skeleton className="h-12 w-12 mx-auto mb-4" />
                  <Skeleton className="h-6 w-48 mx-auto mb-2" />
                  <Skeleton className="h-4 w-64 mx-auto" />
                </div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !verification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <h1 className="text-3xl font-bold text-slate-900">Verification Failed</h1>
              </div>
              <p className="text-slate-600">The verification link is invalid or has expired.</p>
            </div>

            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">
                  {error || "This verification link is invalid, expired, or has already been used."}
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  Email verification links can only be used once for security purposes.
                </p>
                <Link href="/">
                  <Button className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-slate-900">Email Verification</h1>
            </div>
            <p className="text-slate-600">Email open tracking and blockchain verification</p>
          </div>

          {/* Verification Status */}
          <div className="flex justify-center mb-6">
            <Badge
              variant="outline"
              className={`flex items-center gap-2 px-4 py-2 text-sm ${
                verification.alreadyOpened
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              {verification.alreadyOpened ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Previously Opened
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Email Verified as Opened
                </>
              )}
            </Badge>
          </div>

          {/* Verification Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {verification.alreadyOpened ? "Email Already Verified" : "✅ Email Successfully Verified"}
              </CardTitle>
              <CardDescription>
                {verification.alreadyOpened
                  ? "This email was previously verified as opened"
                  : "This email has been verified as opened and recorded on the blockchain"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Success Message */}
              {!verification.alreadyOpened && (
                <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Email Opened Successfully!</h3>
                  <p className="text-sm text-green-700">
                    The email open event has been recorded and verified on the blockchain.
                  </p>
                </div>
              )}

              {/* Email Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-slate-700">Email Subject:</span>
                  <span className="text-sm text-slate-600">{verification.subject}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-slate-700">Recipient:</span>
                  <span className="text-sm text-slate-600 font-mono">{maskEmail(verification.recipientEmail)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-slate-700">Sender Address:</span>
                  <span className="text-sm text-slate-600 font-mono">
                    {verification.senderAddress.slice(0, 6)}...{verification.senderAddress.slice(-4)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {verification.alreadyOpened ? "Previously Opened:" : "Opened At:"}
                  </span>
                  <span className="text-sm text-slate-600">{formatTimestamp(verification.openedAt)}</span>
                </div>

                {verification.txHash && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-slate-700">Transaction Hash:</span>
                    <span className="text-sm text-slate-600 font-mono">
                      {verification.txHash.slice(0, 10)}...{verification.txHash.slice(-8)}
                    </span>
                  </div>
                )}

                {verification.blockNumber && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-slate-700">Block Number:</span>
                    <span className="text-sm text-slate-600 font-mono">
                      #{verification.blockNumber.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Blockchain Verification */}
              {verification.txHash && (
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-medium text-slate-700">Blockchain Verification</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    This email open event has been recorded on the blockchain for immutable proof of delivery and
                    engagement.
                  </p>
                  <Button asChild className="w-full">
                    <a
                      href={getBlockscoutUrl(verification.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Transaction on Blockscout
                    </a>
                  </Button>
                </div>
              )}

              {/* One-time Use Notice */}
              <div className="border-t pt-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-1">Security Notice</h4>
                      <p className="text-sm text-blue-700">
                        This verification link can only be used once for security purposes.
                        {verification.alreadyOpened
                          ? " This link has already been used."
                          : " It has now been marked as used."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="text-center mt-8 space-y-4">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2 mx-auto">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <p className="text-sm text-slate-500">Thank you for using LexProof - Blockchain Email Verification</p>
          </div>
        </div>
      </div>
    </div>
  )
}
