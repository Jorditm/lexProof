import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "eciesjs";


export async function POST(req: NextRequest) {
    const { content } = await req.json();

    const encrypted = encrypt(process.env.CONTENT_PUBLIC_KEY!, content).toString('hex');
    return NextResponse.json({ encrypted });
}