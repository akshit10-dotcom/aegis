import * as snarkjs from "snarkjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCeremony() {
  console.log("🚀 Starting Groth16 Trusted Setup for AegisID Circuit...");
  const buildDir = path.join(__dirname, "../circuits/build");
  const contractsDir = path.join(__dirname, "../contracts");
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const r1csPath = path.join(buildDir, "aegis_identity.r1cs");
  const ptau0Path = path.join(buildDir, "pot15_0000.ptau");
  const ptau1Path = path.join(buildDir, "pot15_0001.ptau");
  const ptauFinalPath = path.join(buildDir, "pot15_final.ptau");
  const zkey0Path = path.join(buildDir, "aegis_identity_0000.zkey");
  const zkeyFinalPath = path.join(buildDir, "aegis_identity_final.zkey");
  const vkeyPath = path.join(buildDir, "verification_key.json");
  const solidityVerifierPath = path.join(contractsDir, "AegisVerifier.sol");

  console.log("1/6 Generating Powers of Tau (2^15 for ~16k constraints)...");
  await snarkjs.powersOfTau.newAccumulator({ type: "mem" }, 15, ptau0Path);

  console.log("2/6 Contributing entropy to Phase 1...");
  await snarkjs.powersOfTau.contribute(ptau0Path, ptau1Path, "AegisContributor", "aegis_random_entropy_seed_2026");

  console.log("3/6 Preparing Phase 2...");
  await snarkjs.powersOfTau.preparePhase2(ptau1Path, ptauFinalPath);

  console.log("4/6 Running Groth16 Circuit Setup...");
  await snarkjs.zKey.newZKey(r1csPath, ptauFinalPath, zkey0Path);

  console.log("5/6 Contributing entropy to Phase 2 (ZKey)...");
  await snarkjs.zKey.contribute(zkey0Path, zkeyFinalPath, "AegisZKeyContributor", "aegis_zkey_phase2_entropy_seed");

  console.log("6/6 Exporting Verification Key & Solidity Verifier Contract...");
  const vKey = await snarkjs.zKey.exportVerificationKey(zkeyFinalPath);
  fs.writeFileSync(vkeyPath, JSON.stringify(vKey, null, 2));

  const verifierTemplate = fs.readFileSync(
    path.join(__dirname, "../node_modules/snarkjs/templates/verifier_groth16.sol.ejs"),
    "utf-8"
  );
  const solidityCode = await snarkjs.zKey.exportSolidityVerifier(zkeyFinalPath, { groth16: verifierTemplate });
  fs.writeFileSync(solidityVerifierPath, solidityCode);

  // Copy WASM and final zkey to public directory so web browser client can fetch it
  const publicCryptoDir = path.join(__dirname, "../public/zk");
  if (!fs.existsSync(publicCryptoDir)) {
    fs.mkdirSync(publicCryptoDir, { recursive: true });
  }

  fs.copyFileSync(path.join(buildDir, "aegis_identity_js/aegis_identity.wasm"), path.join(publicCryptoDir, "aegis_identity.wasm"));
  fs.copyFileSync(zkeyFinalPath, path.join(publicCryptoDir, "aegis_identity_final.zkey"));
  fs.copyFileSync(vkeyPath, path.join(publicCryptoDir, "verification_key.json"));

  // Clean up intermediate ptau and zkey0 to save disk space
  if (fs.existsSync(ptau0Path)) fs.unlinkSync(ptau0Path);
  if (fs.existsSync(ptau1Path)) fs.unlinkSync(ptau1Path);
  if (fs.existsSync(zkey0Path)) fs.unlinkSync(zkey0Path);

  console.log("✅ Groth16 Ceremony Completed successfully!");
  console.log(`📁 Artifacts generated:`);
  console.log(`   - Circuits build: ${buildDir}`);
  console.log(`   - Solidity verifier: ${solidityVerifierPath}`);
  console.log(`   - Web public bundle: ${publicCryptoDir}`);
}

runCeremony().catch((err) => {
  console.error("❌ Error in ceremony:", err);
  process.exit(1);
});
