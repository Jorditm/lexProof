"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Mail, ExternalLink, Copy, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Email {
  id: string
  to: string
  subject: string
  message: string
  from: string
  timestamp: string
  status: "sent" | "delivered" | "opened" | "verified"
  txHash: string
}

export function EmailDashboard() {
  const [emails, setEmails] = useState<Email[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load emails from localStorage
    const savedEmails = JSON.parse(localStorage.getItem("sentEmails") || "[]")

    // Simulate status updates for demo
    const updatedEmails = savedEmails.map((email: Email) => {
      const timeDiff = Date.now() - new Date(email.timestamp).getTime()
      const minutes = timeDiff / (1000 * 60)

      if (minutes > 5) return { ...email, status: "verified" }
      if (minutes > 3) return { ...email, status: "opened" }
      if (minutes > 1) return { ...email, status: "delivered" }
      return email
    })

    setEmails(updatedEmails)
  }, [])

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: { variant: "secondary" as const, label: "Sent" },
      delivered: { variant: "default" as const, label: "Delivered" },
      opened: { variant: "default" as const, label: "Opened" },
      verified: { variant: "default" as const, label: "Verified" },
    }

    const config = variants[status as keyof typeof variants] || variants.sent

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
    )
  }

  const copyTxHash = (txHash: string) => {
    navigator.clipboard.writeText(txHash)
    toast({
      title: "Transaction hash copied",
      description: "Transaction hash copied to clipboard",
    })
  }

  const deleteEmail = (id: string) => {
    const updatedEmails = emails.filter((email) => email.id !== id)
    setEmails(updatedEmails)
    localStorage.setItem("sentEmails", JSON.stringify(updatedEmails))

    toast({
      title: "Email deleted",
      description: "Email removed from dashboard",
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Dashboard
        </CardTitle>
        <CardDescription>Track your sent emails and their verification status</CardDescription>
      </CardHeader>
      <CardContent>
        {emails.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No emails sent yet</p>
            <p className="text-sm text-slate-500">Send your first verified email to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {emails.length} email{emails.length !== 1 ? "s" : ""} sent
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
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.to}</TableCell>
                      <TableCell>{truncateText(email.subject, 30)}</TableCell>
                      <TableCell>{getStatusBadge(email.status)}</TableCell>
                      <TableCell className="text-sm text-slate-600">{formatDate(email.timestamp)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{email.txHash.slice(0, 8)}...</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyTxHash(email.txHash)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://etherscan.io/tx/${email.txHash}`, "_blank")}
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEmail(email.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
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
  )
}
