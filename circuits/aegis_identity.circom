pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/eddsaposeidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/*
 * AegisIdentity: Zero-Knowledge Identity Verification Circuit
 * 
 * Proves in Zero-Knowledge:
 * 1. Issuer Authenticity: Credential was signed with EdDSA over BabyJubjub by accredited issuer.
 * 2. Attribute Predicates:
 *    - Age >= minAge (e.g. 18)
 *    - CIBIL score >= minCibil (e.g. 750)
 *    - Country == expectedCountry (if expectedCountry > 0)
 * 3. Dynamic Non-Revocation: Proves leaf at credentialIndex is 0 in 32-depth Sparse Merkle Tree.
 * 4. Sybil Resistance: Computes deterministic app-scoped nullifier = Poseidon(userSecret, appScopeId).
 */
template AegisIdentity(TREE_DEPTH) {
    // ==========================================
    // 1. PUBLIC INPUTS (Known to Verifier)
    // ==========================================
    signal input issuerPubKeyX;
    signal input issuerPubKeyY;
    signal input smtRoot;
    signal input appScopeId;
    signal input minAge;
    signal input minCibil;
    signal input expectedCountry;

    // ==========================================
    // 2. PRIVATE INPUTS (Held only in user vault)
    // ==========================================
    signal input userSecret;
    signal input age;
    signal input countryCode;
    signal input cibilScore;
    signal input incomeLakhs;
    signal input credentialIndex;

    // Issuer EdDSA signature over credential commitment
    signal input sig_R8x;
    signal input sig_R8y;
    signal input sig_S;

    // SMT non-revocation Merkle siblings (path)
    signal input smtSiblings[TREE_DEPTH];

    // ==========================================
    // 3. PUBLIC OUTPUTS
    // ==========================================
    signal output nullifier;
    signal output isEligible;

    // ------------------------------------------
    // STEP A: Calculate Credential Commitment
    // ------------------------------------------
    // Commitment = Poseidon(userSecret, age, countryCode, cibilScore, incomeLakhs, credentialIndex)
    // Note: Poseidon in circomlib supports up to 6 inputs in Poseidon(6)
    component credHasher = Poseidon(6);
    credHasher.inputs[0] <== userSecret;
    credHasher.inputs[1] <== age;
    credHasher.inputs[2] <== countryCode;
    credHasher.inputs[3] <== cibilScore;
    credHasher.inputs[4] <== incomeLakhs;
    credHasher.inputs[5] <== credentialIndex;

    signal credentialCommitment;
    credentialCommitment <== credHasher.out;

    // ------------------------------------------
    // STEP B: Verify Issuer EdDSA Signature
    // ------------------------------------------
    // Verifies that IssuerPubKey signed the credential commitment
    component sigVerifier = EdDSAPoseidonVerifier();
    sigVerifier.enabled <== 1;
    sigVerifier.Ax <== issuerPubKeyX;
    sigVerifier.Ay <== issuerPubKeyY;
    sigVerifier.R8x <== sig_R8x;
    sigVerifier.R8y <== sig_R8y;
    sigVerifier.S <== sig_S;
    sigVerifier.M <== credentialCommitment;

    // ------------------------------------------
    // STEP C: Predicate & Range Checks
    // ------------------------------------------
    // 1. Check Age >= minAge
    component ageCheck = GreaterEqThan(16);
    ageCheck.in[0] <== age;
    ageCheck.in[1] <== minAge;
    ageCheck.out === 1;

    // 2. Check CIBIL >= minCibil
    component cibilCheck = GreaterEqThan(16);
    cibilCheck.in[0] <== cibilScore;
    cibilCheck.in[1] <== minCibil;
    cibilCheck.out === 1;

    // 3. Check Country Code if expectedCountry > 0
    component countryCheck = IsEqual();
    countryCheck.in[0] <== countryCode;
    countryCheck.in[1] <== expectedCountry;
    
    // Either expectedCountry is 0 (check bypassed) or countryCode == expectedCountry
    signal countryMatches;
    countryMatches <== countryCheck.out;

    component countryZeroCheck = IsEqual();
    countryZeroCheck.in[0] <== expectedCountry;
    countryZeroCheck.in[1] <== 0;

    (1 - countryZeroCheck.out) * (countryMatches - 1) === 0;

    // ------------------------------------------
    // STEP D: Sparse Merkle Tree Non-Revocation
    // ------------------------------------------
    // In a revocation tree, a revoked credential leaf is set to 1.
    // An active (non-revoked) credential leaf is 0.
    // We verify the path from leaf=0 at credentialIndex up to smtRoot.
    signal currentHash[TREE_DEPTH + 1];
    currentHash[0] <== 0; // Leaf value for non-revoked credential is 0

    component hashers[TREE_DEPTH];
    signal bitSelectors[TREE_DEPTH];

    // Decompose credentialIndex into binary bits for tree direction
    for (var i = 0; i < TREE_DEPTH; i++) {
        bitSelectors[i] <-- (credentialIndex >> i) & 1;
        // Enforce bit is binary
        bitSelectors[i] * (1 - bitSelectors[i]) === 0;

        hashers[i] = Poseidon(2);
        // If bit == 0, current is left child, sibling is right child
        // If bit == 1, sibling is left child, current is right child
        hashers[i].inputs[0] <== currentHash[i] + bitSelectors[i] * (smtSiblings[i] - currentHash[i]);
        hashers[i].inputs[1] <== smtSiblings[i] + bitSelectors[i] * (currentHash[i] - smtSiblings[i]);

        currentHash[i + 1] <== hashers[i].out;
    }

    // Enforce computed root matches published on-chain smtRoot
    currentHash[TREE_DEPTH] === smtRoot;

    // ------------------------------------------
    // STEP E: Derive App-Scoped Nullifier
    // ------------------------------------------
    // Nullifier = Poseidon(userSecret, appScopeId)
    // Guarantees single-use per app, but zero linkability across different apps!
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== userSecret;
    nullifierHasher.inputs[1] <== appScopeId;
    nullifier <== nullifierHasher.out;

    isEligible <== 1;
}

component main {public [issuerPubKeyX, issuerPubKeyY, smtRoot, appScopeId, minAge, minCibil, expectedCountry]} = AegisIdentity(32);
