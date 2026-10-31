import * as snarkjs from "snarkjs";

/**
 * Generate Groth16 Zero-Knowledge Proof in Client/Browser
 */
export async function generateAegisProof({
  // Public Inputs
  issuerPubKeyX,
  issuerPubKeyY,
  smtRoot,
  appScopeId,
  minAge,
  minCibil,
  expectedCountry,

  // Private Inputs
  userSecret,
  age,
  countryCode,
  cibilScore,
  incomeLakhs,
  credentialIndex,
  sig_R8x,
  sig_R8y,
  sig_S,
  smtSiblings
}) {
  const circuitInputs = {
    issuerPubKeyX: issuerPubKeyX.toString(),
    issuerPubKeyY: issuerPubKeyY.toString(),
    smtRoot: smtRoot.toString(),
    appScopeId: appScopeId.toString(),
    minAge: minAge.toString(),
    minCibil: minCibil.toString(),
    expectedCountry: expectedCountry.toString(),

    userSecret: userSecret.toString(),
    age: age.toString(),
    countryCode: countryCode.toString(),
    cibilScore: cibilScore.toString(),
    incomeLakhs: incomeLakhs.toString(),
    credentialIndex: credentialIndex.toString(),

    sig_R8x: sig_R8x.toString(),
    sig_R8y: sig_R8y.toString(),
    sig_S: sig_S.toString(),
    smtSiblings: smtSiblings.map((s) => s.toString())
  };

  const startTime = performance.now();

  const wasmPath = "/zk/aegis_identity.wasm";
  const zkeyPath = "/zk/aegis_identity_final.zkey";

  let wasmInput = wasmPath;
  let zkeyInput = zkeyPath;

  if (typeof window !== "undefined") {
    // Cache the buffers in memory so re-proving doesn't re-fetch 12MB
    if (!window._aegisZkWasmBuffer || !window._aegisZkKeyBuffer) {
      console.log("Fetching ZK proving artifacts (/zk/aegis_identity.wasm & final.zkey)...");
      const [wasmRes, zkeyRes] = await Promise.all([
        fetch(wasmPath).then((r) => {
          if (!r.ok) throw new Error(`Failed to load ${wasmPath}: ${r.statusText}`);
          return r.arrayBuffer();
        }),
        fetch(zkeyPath).then((r) => {
          if (!r.ok) throw new Error(`Failed to load ${zkeyPath}: ${r.statusText}`);
          return r.arrayBuffer();
        })
      ]);
      window._aegisZkWasmBuffer = new Uint8Array(wasmRes);
      window._aegisZkKeyBuffer = new Uint8Array(zkeyRes);
    }
    wasmInput = window._aegisZkWasmBuffer;
    zkeyInput = window._aegisZkKeyBuffer;
  }

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    circuitInputs,
    wasmInput,
    zkeyInput
  );

  const durationMs = (performance.now() - startTime).toFixed(1);

  return {
    proof,
    publicSignals,
    durationMs,
    nullifier: publicSignals[0],
    isEligible: publicSignals[1] === "1"
  };
}

/**
 * Verify proof client-side or off-chain using the exported verification key
 */
export async function verifyAegisProof(proof, publicSignals) {
  const vKeyResponse = await fetch("/zk/verification_key.json");
  const vKey = await vKeyResponse.json();

  const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  return isValid;
}

/**
 * Format Groth16 proof into EVM Solidity Calldata [a, b, c, publicSignals]
 */
export async function exportSolidityCalldata(proof, publicSignals) {
  const calldataStr = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
  const argv = JSON.parse(`[${calldataStr}]`);
  return {
    a: argv[0],
    b: argv[1],
    c: argv[2],
    input: argv[3]
  };
}
