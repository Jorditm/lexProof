import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import LexproofTemplate from "@/emails/LexProofEmail";
import Nylas from "nylas";

// Configura el cliente de Nylas
const nylas = new Nylas({
  apiKey: process.env.NYLAS_BEARER_TOKEN!,
  apiUri: process.env.NYLAS_API_URI || "https://api.us.nylas.com",
});

export async function POST(req: NextRequest) {
  console.info("Received POST request to /api/email/send");

  const emailData = await req.json();
  console.info("Parsed emailData:", emailData);
  console.info("nylas:", nylas);

  const {
    to,
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

  if (!to || !subject || !message) {
    console.info("Missing required fields:", { to, subject, message });
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
            name: "Lexxproof",
            email: to,
          },
        ],
      },
    });

    console.info("Email sent successfully via Nylas. Response:", sentMessage);
    return NextResponse.json({ success: true, data: sentMessage });
  } catch (error) {
    console.error("Error sending email via Nylas:", error);
    return NextResponse.json(
      { error: "Failed to send email via Nylas" },
      { status: 500 }
    );
  }
}
