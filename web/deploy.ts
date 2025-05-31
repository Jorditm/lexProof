//TODO: REPLACE BY THE CURRENT PROVER AND VERIFIER SPEC
import proverSpec from "../out/EmailDomainProver.sol/EmailDomainProver";
import verifierSpec from "../out/EmailProofVerifier.sol/EmailDomainVerifier";
import {
  deployVlayerContracts,
  writeEnvVariables,
  getConfig,
} from "@vlayer/sdk/config";

async function main() {
  const config = getConfig();

  const { prover, verifier } = await deployVlayerContracts({
    proverSpec,
    verifierSpec,
    proverArgs: [],
    verifierArgs: [],
  });

  await writeEnvVariables(".env.local", {
    NEXT_PUBLIC_PROVER_ADDRESS: prover,
    NEXT_PUBLIC_VERIFIER_ADDRESS: verifier,
    NEXT_PUBLIC_CHAIN_NAME: config.chainName,
    NEXT_PUBLIC_PROVER_URL: config.proverUrl,
    NEXT_PUBLIC_JSON_RPC_URL: config.jsonRpcUrl,
    PRIVATE_KEY: config.privateKey,
    NEXT_PUBLIC_DNS_SERVICE_URL: config.dnsServiceUrl,
    NEXT_PUBLIC_VLAYER_API_TOKEN: config.token,
    NEXT_PUBLIC_EMAIL_SERVICE_URL: process.env.EMAIL_SERVICE_URL || "",
    NEXT_PUBLIC_GAS_LIMIT: config.gasLimit,
  });

  console.log("Contracts deployed and .env.local written.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
