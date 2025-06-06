import { db } from "@/lib/db";
import { decrypt } from "eciesjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { sender } = await request.json();
  const emails = await db.execute({
    sql: `SELECT * FROM emails WHERE sender = ?`,
    args: ["0xfaB71618C291D0363B5c6A4a5784cB829Deb4A38"],
  });
  const decryptedEmails = emails?.rows?.map((email: any) => {
    return {
      ...email,
      subject: decrypt(
        process.env.CONTENT_PRIVATE_KEY!,
        Buffer.from(email.subject, "hex")
      ).toString(),
      content: decrypt(
        process.env.CONTENT_PRIVATE_KEY!,
        Buffer.from(email.content, "hex")
      ).toString(),
    };
  });
  return NextResponse.json(decryptedEmails);
}
