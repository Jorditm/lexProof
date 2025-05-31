// scripts/copy-full-contract-jsons.ts
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contracts = [
  { file: "LexProofProver.sol", name: "LexProofProver" },
  { file: "LexProofVerifier.sol", name: "LexProofVerifier" },
];

// Rutas base
const outDir = path.resolve(__dirname, "../../../out");
const outputDir = path.resolve(__dirname, "../abis");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

try {
  console.log("🔨 Compilando contratos...");
  execSync("forge build", { stdio: "inherit" });
} catch (err) {
  console.error("❌ Error al compilar con forge");
  process.exit(1);
}

for (const contract of contracts) {
  const sourcePath = path.join(outDir, contract.file, `${contract.name}.json`);
  const destPath = path.join(outputDir, `${contract.name}.json`);

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ No se encontró ${sourcePath}`);
    continue;
  }

  fs.copyFileSync(sourcePath, destPath);
  console.log(`✅ Copiado: ${contract.name} a ${destPath}`);
}
