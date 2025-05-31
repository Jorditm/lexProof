import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import LexproofTemplate from "@/emails/LexProofEmail";
import Nylas from "nylas";
import { db } from "@/lib/db";

// Configura el cliente de Nylas
const nylas = new Nylas({
  apiKey: process.env.NYLAS_BEARER_TOKEN!,
  apiUri: process.env.NYLAS_API_URI || "https://api.us.nylas.com",
});

export async function POST(req: NextRequest) {
  console.info("Received POST request to /api/email/send");
  const emailData = await req.json();

  const {
    to,
    cc,
    subject,
    message,
    from,
    id,
    timestamp,
    status,
    txHash,
    verificationLink,
    signature,
  } = emailData;

  if (!to || !cc || !subject || !message) {
    console.info("Missing required fields:", { to, cc, subject, message });
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Renderiza el contenido HTML del correo electrónico
  const html = await render(
    LexproofTemplate({
      body: message,
    })
  );
  console.info("Rendered HTML email content.");

  try {
    // Envía el correo electrónico utilizando el SDK de Nylas
    const sentMessage = await nylas.messages.send({
      identifier: process.env.NYLAS_SENDER_GRANT_ID!,
      requestBody: {
        subject,
        body: html,
        to: [
          {
            name: "LexProof",
            email: to,
          },
        ],
        cc: [
          {
            name: "Recipient",
            email: cc,
          },
        ],
      },
    });

    console.info("Email sent successfully via Nylas. Response:", sentMessage);
  } catch (error) {
    console.error("Error sending email via Nylas:", error);
    return NextResponse.json(
      { error: "Failed to send email via Nylas" },
      { status: 500 }
    );
  }

  try {
    const baseUrl = req.nextUrl.origin;
    const encryptedSubject = await fetch(`${baseUrl}/api/encrypt/encrypt-content`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: subject }),
    });
    const encryptedSubjectResponse = await encryptedSubject.json();
    console.info("Encrypted subject:", encryptedSubjectResponse);

    const encryptedMessage = await fetch(`${baseUrl}/api/encrypt/encrypt-content`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message }),
    });
    const encryptedMessageResponse = await encryptedMessage.json();
    console.info("Encrypted message:", encryptedMessageResponse);

    // Save the email to the database
    const result = await db.execute(
      "INSERT INTO emails (subject, recipient, sender, content) VALUES (?, ?, ?, ?)",
      [encryptedSubjectResponse.encrypted, cc, from, encryptedMessageResponse.encrypted]
    );
    console.info("Email saved to database:", result);

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error("Error encrypting content:", error);
    return NextResponse.json(
      { error: "Failed to encrypt content" },
      { status: 500 }
    );
  }
}
