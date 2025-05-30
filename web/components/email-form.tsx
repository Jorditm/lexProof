"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, Shield, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailFormProps {
  walletAddress: string
}

export function EmailForm({ walletAddress }: EmailFormProps) {
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const { toast } = useToast()

  const verifyEmail = async () => {
    setIsVerifying(true)

    try {
      // Mock vlayer email verification
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real implementation, this would:
      // 1. Use vlayer to verify email ownership
      // 2. Generate cryptographic proof
      // 3. Sign message with wallet

      toast({
        title: "Email verified",
        description: "Email ownership verified using vlayer",
      })

      return true
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Failed to verify email ownership",
        variant: "destructive",
      })
      return false
    } finally {
      setIsVerifying(false)
    }
  }

  const sendEmail = async () => {
    if (!email || !subject || !message) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      // Mock email sending with blockchain proof
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // In a real implementation, this would:
      // 1. Send email via traditional email service
      // 2. Store proof hash on blockchain
      // 3. Create delivery tracking record

      const emailData = {
        id: Date.now().toString(),
        to: email,
        subject,
        message,
        from: walletAddress,
        timestamp: new Date().toISOString(),
        status: "sent",
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      }

      // Store in localStorage for demo purposes
      const existingEmails = JSON.parse(localStorage.getItem("sentEmails") || "[]")
      existingEmails.push(emailData)
      localStorage.setItem("sentEmails", JSON.stringify(existingEmails))

      toast({
        title: "Email sent successfully",
        description: "Email sent and proof stored on-chain",
      })

      // Reset form
      setEmail("")
      setSubject("")
      setMessage("")
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: "An error occurred while sending the email",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Email Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Compose Email
          </CardTitle>
          <CardDescription>Send a verified email with on-chain proof of delivery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="recipient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Your message..."
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={verifyEmail}
              disabled={!email || isVerifying}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              Verify Email
            </Button>

            <Button
              onClick={sendEmail}
              disabled={!email || !subject || !message || isSending}
              className="flex items-center gap-2 flex-1"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* vlayer Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            vlayer Integration
          </CardTitle>
          <CardDescription>How email verification works with vlayer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                1
              </Badge>
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-slate-600">vlayer verifies email ownership through cryptographic proof</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                2
              </Badge>
              <div>
                <p className="font-medium">Message Signing</p>
                <p className="text-sm text-slate-600">Your wallet signs the email content for authenticity</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                3
              </Badge>
              <div>
                <p className="font-medium">On-chain Storage</p>
                <p className="text-sm text-slate-600">Email hash and proof are stored on the blockchain</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                4
              </Badge>
              <div>
                <p className="font-medium">Delivery Tracking</p>
                <p className="text-sm text-slate-600">Track email status and verify delivery authenticity</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-slate-500">
              This is a hackathon prototype. In production, vlayer would handle the actual email verification and proof
              generation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
