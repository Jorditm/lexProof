"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Shield,
  Send,
  Loader2,
  Bold,
  Italic,
  Undo,
  Redo,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TipTapLink from "@tiptap/extension-link";
import { useSignMessage } from "wagmi";

interface EmailFormProps {
  walletAddress: string;
}

export function EmailForm({ walletAddress }: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [isSending, setIsSending] = useState(false);
  // const { openTxToast } = useNotification();
  const { signMessageAsync } = useSignMessage();

  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TipTapLink.configure({
        openOnClick: false,
      }),
    ],
    content: "",
  });

  const generateVerificationLink = (emailId: string) => {
    // Generate a unique verification ID
    const verificationId = `${emailId}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    return `${window.location.origin}/verify/open/${verificationId}`;
  };

  const sendEmail = async () => {
    if (!email || !subject || (editor && editor.isEmpty)) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const messageContent = editor?.getHTML() || "";
      const emailId = Date.now().toString();
      const verificationLink = generateVerificationLink(emailId);

      // 1. Firma el mensaje antes de cualquier envío
      const signature = await signMessageAsync({
        message: `Sign this message to confirm email: ${emailId}`,
      });

      // 2. Si la firma fue exitosa, construye el payload
      const emailData = {
        id: emailId,
        to: email,
        subject,
        message: messageContent,
        from: walletAddress,
        timestamp: new Date().toISOString(),
        status: "sent",
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        verificationLink,
        signature,
      };

      // 3. Envío al endpoint
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) throw new Error("API error");

      toast({
        title: "Email sent successfully",
        description: "Email sent with verification tracking enabled",
      });

      toast({
        title: "Demo: Verification Link Generated",
        description: `Click to simulate email open: ${verificationLink}`,
        duration: 10000,
      });

      // Reset form
      setEmail("");
      setSubject("");
      editor?.commands.clearContent();
    } catch (error) {
      toast({
        title: "Failed to send email",
        description:
          "An error occurred while signing or sending. Make sure you accepted the signature request.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Email Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Compose Email
          </CardTitle>
          <CardDescription>
            Send a verified email with on-chain proof of delivery
          </CardDescription>
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
            <div className="border rounded-md">
              <div className="flex items-center gap-1 p-1 border-b bg-slate-50">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  disabled={!editor?.can().chain().focus().toggleBold().run()}
                  data-active={editor?.isActive("bold")}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  disabled={!editor?.can().chain().focus().toggleItalic().run()}
                  data-active={editor?.isActive("italic")}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    editor?.chain().focus().toggleUnderline().run()
                  }
                  disabled={
                    !editor?.can().chain().focus().toggleUnderline().run()
                  }
                  data-active={editor?.isActive("underline")}
                >
                  <span className="underline text-xs font-bold">U</span>
                </Button>
                <span className="w-px h-4 bg-slate-300 mx-1"></span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => editor?.chain().focus().undo().run()}
                  disabled={!editor?.can().chain().focus().undo().run()}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => editor?.chain().focus().redo().run()}
                  disabled={!editor?.can().chain().focus().redo().run()}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-3 min-h-[200px] prose prose-sm max-w-none">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={sendEmail}
              disabled={
                !email || !subject || (editor && editor.isEmpty) || isSending
              }
              className="flex items-center gap-2 flex-1"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
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
          <CardDescription>
            How email verification works with vlayer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                1
              </Badge>
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-slate-600">
                  vlayer verifies email ownership through cryptographic proof
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                2
              </Badge>
              <div>
                <p className="font-medium">Message Signing</p>
                <p className="text-sm text-slate-600">
                  Your wallet signs the email content for authenticity
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                3
              </Badge>
              <div>
                <p className="font-medium">On-chain Storage</p>
                <p className="text-sm text-slate-600">
                  Email hash and proof are stored on the blockchain
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                4
              </Badge>
              <div>
                <p className="font-medium">Open Tracking</p>
                <p className="text-sm text-slate-600">
                  One-time verification links track email opens securely
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-slate-500">
              This is a hackathon prototype. In production, vlayer would handle
              the actual email verification and proof generation.
            </p>
          </div>
        </CardContent>
      </Card>
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 150px;
        }
        [data-active="true"] {
          background-color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
