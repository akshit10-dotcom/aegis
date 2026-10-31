import { buildEddsa, buildPoseidon } from "circomlibjs";

let eddsaInstance = null;
let poseidonInstance = null;

export async function getCryptoPrimitives() {
  if (!eddsaInstance) {
    eddsaInstance = await buildEddsa();
  }
  if (!poseidonInstance) {
    poseidonInstance = await buildPoseidon();
  }
  return { eddsa: eddsaInstance, poseidon: poseidonInstance };
}

/**
 * Generate a deterministic or random Issuer keypair on BabyJubjub curve
 */
export async function createIssuerKeypair(seed = "aegis_trusted_issuer_seed_2026") {
  const { eddsa } = await getCryptoPrimitives();
  // Derive 32-byte private key from seed
  const encoder = new TextEncoder();
  const seedBytes = encoder.encode(seed);
  const privKey = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    privKey[i] = seedBytes[i % seedBytes.length] ^ (i * 7);
  }

  const pubKey = eddsa.prv2pub(privKey);
  return {
    privKey,
    pubKeyX: eddsa.F.toString(pubKey[0]),
    pubKeyY: eddsa.F.toString(pubKey[1]),
    rawPubKey: pubKey
  };
}

/**
 * Generate a Poseidon commitment for user credential attributes
 * Commitment = Poseidon(userSecret, age, countryCode, cibilScore, incomeLakhs, credentialIndex)
 */
export async function computeCredentialCommitment({
  userSecret,
  age,
  countryCode,
  cibilScore,
  incomeLakhs,
  credentialIndex
}) {
  const { poseidon } = await getCryptoPrimitives();
  const hash = poseidon([
    BigInt(userSecret),
    BigInt(age),
    BigInt(countryCode),
    BigInt(cibilScore),
    BigInt(incomeLakhs),
    BigInt(credentialIndex)
  ]);
  return {
    raw: hash,
    decimalString: poseidon.F.toString(hash)
  };
}

/**
 * Sign the credential commitment with Issuer's BabyJubjub private key
 */
export async function signCredential(issuerPrivKey, commitmentBigInt) {
  const { eddsa } = await getCryptoPrimitives();
  const signature = eddsa.signPoseidon(issuerPrivKey, commitmentBigInt);

  return {
    R8x: eddsa.F.toString(signature.R8[0]),
    R8y: eddsa.F.toString(signature.R8[1]),
    S: signature.S.toString()
  };
}
