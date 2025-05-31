import { createVlayerClient, preverifyEmail, Proof } from "@vlayer/sdk";
import { NextResponse } from "next/server";

import proverSpec from "@/lib/abis/LexProofProver.json";
import verifierSpec from "@/lib/abis/LexProofVerifier.json";
import type { Abi } from "viem";
import { createWalletClient, http, createPublicClient } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

function extractMessageId(fullMessageId: string): string {
  const match = fullMessageId.match(/<([^@]+)@/);
  return match ? match[1] : fullMessageId;
}

export async function POST(request: Request) {
  const requestBody = await request.json();

  const fullMessageId = requestBody.data.object.id;
  const messageId = extractMessageId(fullMessageId);

  console.log("Full message ID:", fullMessageId);
  console.log("Extracted message ID:", messageId);

  const nylasUrl = `https://api.us.nylas.com/v3/grants/${process.env.NYLAS_GRANT_ID}/messages/${messageId}/?fields=raw_mime`;

  const response = await fetch(nylasUrl, {
    method: "GET",
    headers: {
      Accept: "application/json, application/gzip",
      Authorization: `Bearer ${process.env.NYLAS_BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Nylas API error: ${response.statusText}`);
  }

  const nylasData = await response.json();

  const emailEncoded = Buffer.from(nylasData.data.raw_mime, "base64").toString(
    "utf8"
  );

  const vlayer = createVlayerClient({
    token: process.env.VLAYER_TOKEN!,
    url: "https://stable-fake-prover.vlayer.xyz",
  });

  const preverifiedEmail = await preverifyEmail({
    mimeEmail: emailEncoded,
    dnsResolverUrl: "https://test-dns.vlayer.xyz/dns-query",
    token: process.env.VLAYER_TOKEN!,
  });

  const hash = await vlayer.prove({
    address: "0x06AB866f9fA5C541a898518011Cf284043D25126",
    proverAbi: proverSpec.abi as Abi,
    functionName: "main",
    args: [preverifiedEmail, "0xfaB71618C291D0363B5c6A4a5784cB829Deb4A38"],
    chainId: 11155111,
  });

  const result = (await vlayer.waitForProvingResult({ hash })) as [
    Proof,
    string,
    string,
    string
  ];

  const [proof, emailHash, emailFromDomain, sender] = result;

  console.log(result);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL!),
  });

  const walletClient = createWalletClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL!),
  });

  const account = privateKeyToAccount(
    process.env.PRIVATE_KEY! as `0x${string}`
  );

  const { request: txRequest } = await publicClient.simulateContract({
    account,
    address: "0xeaB42B3a285165C11FB3BB7C12A3043b78615FAC",
    abi: verifierSpec.abi as Abi,
    functionName: "verify",
    args: [proof, emailHash, emailFromDomain, sender],
  });

  const tx = await walletClient.writeContract({
    ...txRequest,
    account,
  });

  return NextResponse.json({ success: true, tx });
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const challenge = searchParams.get("challenge");

  if (challenge) {
    return NextResponse.json({ challenge });
  }

  return NextResponse.json({ message: "No challenge provided" });
}
