import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "eciesjs";


export async function POST(req: NextRequest) {
    const { encryptedContent } = await req.json();

    const encryptedBuffer = Buffer.from(encryptedContent, 'hex');
    const decrypted = decrypt(process.env.CONTENT_PRIVATE_KEY!, encryptedBuffer).toString();
    return NextResponse.json({ decrypted });
}