import { PrivateKey, decrypt, encrypt } from "eciesjs";
import { NextRequest, NextResponse } from "next/server";

const sk = new PrivateKey();
const data = Buffer.from("hello world🌍");
const decrypted = decrypt(sk.secret, encrypt(sk.publicKey.toBytes(), data));
console.log(Buffer.from(decrypted).toString());

console.log("Private Key:", sk.secret.toString("hex"));
console.log("Public Key :", sk.publicKey);

export async function GET(req: NextRequest) {
    const privateKey = sk.secret.toString("hex");
    const publicKey = sk.publicKey.toHex();
    return NextResponse.json({ privateKey, publicKey });
}