import { db } from "@/lib/db";
import { decrypt } from "eciesjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { sender } = await request.json();
  const emails = await db.execute({
    sql: `SELECT * FROM emails WHERE sender = ?`,
    args: [sender],
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
