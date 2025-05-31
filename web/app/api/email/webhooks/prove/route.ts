import { NextResponse } from "next/server";
import { getMimeEmailBase64FromRaw } from "@/lib/nylasToEml";
import { createVlayerClient, preverifyEmail } from "@vlayer/sdk";
//TODO: REPLACE BY THE CURRENT PROVER AND VERIFIER SPEC
import proverSpec from "../out/EmailDomainProver.sol/EmailDomainProver";
import verifierSpec from "../out/EmailProofVerifier.sol/EmailDomainVerifier";

const NYLAS_GRANT_ID = process.env.NYLAS_GRANT_ID;
const NYLAS_BEARER_TOKEN = process.env.NYLAS_BEARER_TOKEN;
const ENDPOINT_SECRET = process.env.ENDPOINT_SECRET;

function extractMessageId(responseData: any): string | undefined {
  const threadId: string | undefined = responseData?.data?.[0]?.thread_id;
  if (!threadId) return undefined;
  // thread_id puede tener formato <...@...>
  const match = threadId.match(/^<?([^@>]+)@/);
  return match ? match[1] : undefined;
}

import {
  createContext,
  deployVlayerContracts,
  getConfig,
} from "@vlayer/sdk/config";

const environment = process.env.ENVIRONMENT || "development";

export async function GET(request: Request) {
  try {
    // Verifica la cabecera de seguridad
    const signHeader = request.headers.get("sign");
    if (!signHeader || signHeader !== ENDPOINT_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch the latest message to get its ID
    const latestMessagesUrl = `https://api.us.nylas.com/v3/grants/${NYLAS_GRANT_ID}/messages?limit=1`;

    const latestMessagesResponse = await fetch(latestMessagesUrl, {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${NYLAS_BEARER_TOKEN}`,
        "Cache-Control": "no-cache",
      },
    });

    if (!latestMessagesResponse.ok) {
      throw new Error(
        `Failed to fetch latest message: ${latestMessagesResponse.statusText}`
      );
    }

    const latestMessagesData = await latestMessagesResponse.json();
    const message_id = extractMessageId(latestMessagesData);

    if (!message_id) {
      throw new Error("No message found");
    }

    const nylasUrl = `https://api.us.nylas.com/v3/grants/${NYLAS_GRANT_ID}/messages/${message_id}/?fields=raw_mime`;

    const response = await fetch(nylasUrl, {
      method: "GET",
      headers: {
        Accept: "application/json, application/gzip",
        Authorization: `Bearer ${NYLAS_BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Nylas API error: ${response.statusText}`);
    }

    const nylasData = await response.json();

    const emailEncoded = await getMimeEmailBase64FromRaw(
      nylasData.data.raw_mime
    );

    const config = getConfig();

    const {
      chain,
      ethClient,
      account: john,
      proverUrl,
      dnsServiceUrl,
      confirmations,
    } = createContext(config);

    if (!john) {
      throw new Error(
        "No account found make sure EXAMPLES_TEST_PRIVATE_KEY is set in your environment variables"
      );
    }

    const { prover, verifier } = await deployVlayerContracts({
      proverSpec,
      verifierSpec,
      proverArgs: [],
      verifierArgs: [],
    });

    if (!dnsServiceUrl) {
      throw new Error("DNS service URL is not set");
    }

    //// Prepare the email for verification
    const unverifiedEmail = await preverifyEmail({
      mimeEmail: emailEncoded,
      dnsResolverUrl:
        environment === "development"
          ? "http://127.0.0.1:3002/dns-query"
          : process.env.DNS_SERVICE_URL!,
    });

    console.log("Proving...");
    const vlayer = createVlayerClient({
      url: proverUrl,
      token: config.token,
    });

    const hash = await vlayer.prove({
      address: prover,
      proverAbi: proverSpec.abi,
      functionName: "main",
      chainId: chain.id,
      gasLimit: config.gasLimit,
      args: [
        await preverifyEmail({
          mimeEmail: emailEncoded,
          dnsResolverUrl: dnsServiceUrl,
          token: config.token,
        }),
      ],
    });
    const result = await vlayer.waitForProvingResult({ hash });

    return NextResponse.json({ success: true, mime: emailEncoded });
  } catch (err) {
    console.error("Error al convertir MIME a base64:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
