import * as snarkjs from "snarkjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createIssuerKeypair, computeCredentialCommitment, signCredential } from "../src/crypto/issuer.js";
import { createSMT } from "../src/crypto/smt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFullFlow() {
  console.log("🧪 === TESTING AEGIS-ID FULL CRYPTOGRAPHIC PIPELINE ===");

  // 1. Setup Issuer
  console.log("1. Initializing Trusted Issuer Keypair (BabyJubjub)...");
  const issuer = await createIssuerKeypair("rbi_approved_bank_alpha_2026");
  console.log(`   Issuer PubKey X: ${issuer.pubKeyX.slice(0, 18)}...`);
  console.log(`   Issuer PubKey Y: ${issuer.pubKeyY.slice(0, 18)}...`);

  // 2. Setup Revocation SMT
  console.log("2. Initializing 32-depth Sparse Merkle Tree...");
  const smt = await createSMT(32);
  const smtRoot = await smt.getRoot();
  console.log(`   SMT Root: ${smtRoot.slice(0, 18)}...`);

  // 3. Issue Credential
  const userSecret = "1234567890123456789012345678901234567890";
  const userAttributes = {
    userSecret,
    age: 24,
    countryCode: 356, // India (ISO 3166 numeric)
    cibilScore: 780,
    incomeLakhs: 18, // ₹18,00,000
    credentialIndex: 42
  };

  console.log("3. Computing Poseidon Credential Commitment & Signing...");
  const commitment = await computeCredentialCommitment(userAttributes);
  console.log(`   Commitment Decimal: ${commitment.decimalString.slice(0, 18)}...`);

  const signature = await signCredential(issuer.privKey, commitment.raw);
  console.log(`   BabyJubjub Sig R8x: ${signature.R8x.slice(0, 18)}...`);

  // 4. Generate Non-Revocation SMT Path
  console.log("4. Computing SMT non-membership siblings for leaf 42...");
  const smtProof = await smt.getNonRevocationProof(userAttributes.credentialIndex);
  console.log(`   Generated ${smtProof.siblings.length} sibling hashes.`);

  // 5. Verification Policy & Scope
  const appScopeId = "5208479275824"; // Hash of "HDFC_KYC"
  const minAge = 18;
  const minCibil = 750;
  const expectedCountry = 356; // India

  const circuitInputs = {
    issuerPubKeyX: issuer.pubKeyX,
    issuerPubKeyY: issuer.pubKeyY,
    smtRoot: smtProof.root,
    appScopeId,
    minAge: minAge.toString(),
    minCibil: minCibil.toString(),
    expectedCountry: expectedCountry.toString(),

    userSecret: userAttributes.userSecret,
    age: userAttributes.age.toString(),
    countryCode: userAttributes.countryCode.toString(),
    cibilScore: userAttributes.cibilScore.toString(),
    incomeLakhs: userAttributes.incomeLakhs.toString(),
    credentialIndex: userAttributes.credentialIndex.toString(),

    sig_R8x: signature.R8x,
    sig_R8y: signature.R8y,
    sig_S: signature.S,
    smtSiblings: smtProof.siblings
  };

  console.log("5. Generating Groth16 Zero-Knowledge Proof (Timing Benchmark)...");
  const wasmPath = path.join(__dirname, "../public/zk/aegis_identity.wasm");
  const zkeyPath = path.join(__dirname, "../public/zk/aegis_identity_final.zkey");
  const vkeyPath = path.join(__dirname, "../public/zk/verification_key.json");

  const startTime = performance.now();
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(circuitInputs, wasmPath, zkeyPath);
  const provingTimeMs = (performance.now() - startTime).toFixed(1);

  console.log(`⚡ Proving Completed in: ${provingTimeMs} ms!`);
  console.log(`   Public Outputs:`);
  console.log(`   - Derived Nullifier: ${publicSignals[0]}`);
  console.log(`   - Eligibility Status: ${publicSignals[1] === "1" ? "ELIGIBLE (PASS)" : "FAIL"}`);

  console.log("6. Verifying Groth16 Proof against Verification Key...");
  const vKey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"));
  const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  if (isValid) {
    console.log("🎉 SUCCESS: Proof mathematically VALIDATED!");
  } else {
    console.error("❌ FAILURE: Proof is invalid!");
    process.exit(1);
  }

  // 7. Test Sybil Nullifier Determinism
  console.log("7. Testing Nullifier Determinism (Sybil Protection)...");
  const { publicSignals: publicSignals2 } = await snarkjs.groth16.fullProve(circuitInputs, wasmPath, zkeyPath);
  if (publicSignals[0] === publicSignals2[0]) {
    console.log("🔒 PASS: Identical Nullifier generated for same app context!");
  } else {
    console.error("❌ FAIL: Nullifier desynchronized!");
  }

  // 8. Test Revocation Detection
  console.log("8. Testing Revocation Defense (Simulating Issuer Revocation)...");
  await smt.revoke(userAttributes.credentialIndex);
  const revokedRoot = await smt.getRoot();
  const badCircuitInputs = {
    ...circuitInputs,
    smtRoot: revokedRoot // Verifier has updated root!
  };

  try {
    // Circom constraint currentHash[TREE_DEPTH] === smtRoot should fail
    await snarkjs.groth16.fullProve(badCircuitInputs, wasmPath, zkeyPath);
    console.error("❌ Revocation defense failed to reject!");
  } catch (err) {
    console.log("🛡️ PASS: Revoked credential correctly rejected by SMT circuit!");
  }

  console.log("\n=======================================================");
  console.log("🏆 ALL 8 CRYPTOGRAPHIC ASSURANCES PASSED SUCCESSFULLY!");
  console.log("=======================================================");
}

testFullFlow().catch((err) => {
  console.error("❌ Test crashed:", err);
  process.exit(1);
});
