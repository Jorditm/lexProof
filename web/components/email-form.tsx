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
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TipTapLink from "@tiptap/extension-link";
import { useSignMessage } from "wagmi";
import { useChainId } from "wagmi";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const emailFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message cannot be empty"),
});

interface EmailFormProps {
  walletAddress: string;
}

export function EmailForm({ walletAddress }: EmailFormProps) {
  const [isSending, setIsSending] = useState(false);
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();

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

  const form = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
      subject: "",
      message: "",
    },
  });

  const generateVerificationLink = (emailId: string) => {
    const verificationId = `${emailId}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    return `${window.location.origin}/verify/open/${verificationId}`;
  };

  const sendEmail = async (data: z.infer<typeof emailFormSchema>) => {
    if (!data.email || !data.subject || (editor && editor.isEmpty)) {
      toast.error("Missing fields");
      return;
    }

    const { email, subject } = data;

    setIsSending(true);

    try {
      await toast.promise(
        (async () => {
          const messageContent = editor?.getHTML() || "";
          const emailId = Date.now().toString();
          const verificationLink = generateVerificationLink(emailId);
          toast.success("Message signed successfully");

          // Paso 2: construir payload
      const emailData = {
        id: emailId,
        to: "lexproof@jordiplanas.cat",
        cc: email,
        subject,
        message: messageContent,
        from: walletAddress,
        timestamp: new Date().toISOString(),
        status: "sent",
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        verificationLink,
        signature,
      };

          // Paso 3: enviar email
          const response = await fetch("/api/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emailData),
          });

          if (!response.ok) {
            throw new Error("Failed to send email");
          }

          // Reset form si fue exitoso
          form.reset();
          editor?.commands.clearContent();
        })(),
        {
          loading: "Signing message and sending email...",
          success: "Email sent successfully",
          error: "Something went wrong during the process",
        }
      );
    } catch (err) {
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> Compose Email
          </CardTitle>
          <CardDescription>
            Send a verified email with on-chain proof of content and delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(sendEmail)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Email</FormLabel>
                    <FormControl>
                      <Input placeholder="recipient@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Email subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <div className="border rounded-md">
                        <div className="flex items-center gap-1 p-1 border-b bg-slate-50">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              editor?.chain().focus().toggleBold().run()
                            }
                            disabled={
                              !editor?.can().chain().focus().toggleBold().run()
                            }
                            data-active={editor?.isActive("bold")}
                          >
                            {" "}
                            <Bold className="h-4 w-4" />{" "}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              editor?.chain().focus().toggleItalic().run()
                            }
                            disabled={
                              !editor
                                ?.can()
                                .chain()
                                .focus()
                                .toggleItalic()
                                .run()
                            }
                            data-active={editor?.isActive("italic")}
                          >
                            {" "}
                            <Italic className="h-4 w-4" />{" "}
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
                              !editor
                                ?.can()
                                .chain()
                                .focus()
                                .toggleUnderline()
                                .run()
                            }
                            data-active={editor?.isActive("underline")}
                          >
                            {" "}
                            <span className="underline text-xs font-bold">
                              U
                            </span>{" "}
                          </Button>
                          <span className="w-px h-4 bg-slate-300 mx-1"></span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => editor?.chain().focus().undo().run()}
                            disabled={
                              !editor?.can().chain().focus().undo().run()
                            }
                          >
                            {" "}
                            <Undo className="h-4 w-4" />{" "}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => editor?.chain().focus().redo().run()}
                            disabled={
                              !editor?.can().chain().focus().redo().run()
                            }
                          >
                            {" "}
                            <Redo className="h-4 w-4" />{" "}
                          </Button>
                        </div>
                        <div className="p-3 min-h-[200px] prose prose-sm max-w-none">
                          <EditorContent
                            editor={editor}
                            onBlur={() =>
                              form.setValue(
                                "message",
                                editor?.getHTML() || "",
                                { shouldValidate: true }
                              )
                            }
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSending}
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
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> vlayer Integration
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
                  vlayer proves and verifies email content and delivery through cryptographic proof
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
                  Your wallet signs the email content for privacy, authenticity and non-repudiation
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                3
              </Badge>
              <div>
                <p className="font-medium">Email proof</p>
                <p className="text-sm text-slate-600">
                  Once proved and verified, an NFT is issued to your address to prove ownership of the email content
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                4
              </Badge>
              <div>
                <p className="font-medium">Privacy and certification</p>
                <p className="text-sm text-slate-600">
                  Access the private information of the email securely with your wallet, and download proof to make it public when needed
                </p>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-xs text-slate-500">
              This is a hackathon prototype. Use it at your own risk.
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
